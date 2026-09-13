// Fetching bear data
var baseUrl = "https://en.wikipedia.org/w/api.php";
var title = "List_of_ursids";

var PLACEHOLDER_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
  '<rect width="100%" height="100%" fill="#ddd"/>' +
  '<text x="50%" y="50%" font-family="Arial" font-size="14" fill="#666" text-anchor="middle" dominant-baseline="middle">No image available</text>' +
  '</svg>'
);

// A URL returned by the Wikipedia API is not a guarantee that it is reachable or a valid image.
const verifyImageLoads = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(PLACEHOLDER_IMAGE);
    img.src = url;
  });
};

async function fetchImageUrl(fileName) {
  var imageParams = {
    action: "query",
    titles: "File:" + fileName,
    prop: "imageinfo",
    iiprop: "url",
    format: "json",
    origin: "*"
  };

  var url = baseUrl + "?" + new URLSearchParams(imageParams).toString();

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Wikipedia image API responded with status ' + res.status);
    }

    const data = await res.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    if (!page || !page.imageinfo || !page.imageinfo[0]) {
      return PLACEHOLDER_IMAGE;
    }

    return await verifyImageLoads(page.imageinfo[0].url);
  } catch (error) {
    console.error('Could not load image for "' + fileName + '":', error);
    return PLACEHOLDER_IMAGE;
  }
}

function parseBearRow(row) {
  const nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
  const binomialMatch = row.match(/\|binomial=(.*?)\n/);
  const imageMatch = row.match(/\|image=(.*?)\n/);
  const rangeMatch = row.match(/\|range=(.*?)\s*\|/);

  if (!nameMatch || !binomialMatch || !imageMatch) {
    return null;
  }

  return {
    name: nameMatch[1],
    binomial: binomialMatch[1],
    fileName: imageMatch[1].trim().replace('File:', ''),
    range: rangeMatch ? rangeMatch[1].replace(/\s*\([^)]*\)/g, '').trim() : 'Unknown'
  };
}

async function extractBears(wikitext) {
  const speciesTables = wikitext.split('{{Species table/end}}');
  const rows = speciesTables
    .flatMap((table) => table.split('{{Species table/row'))
    .map(parseBearRow)
    .filter(Boolean);

  // Each bear's image lookup is independent of the others, so they run concurrently
  const bears = await Promise.all(
    rows.map(async (row) => ({
      name: row.name,
      binomial: row.binomial,
      range: row.range,
      image: await fetchImageUrl(row.fileName)
    }))
  );

  const seenNames = new Set();
  const uniqueBears = bears.filter((bear) => {
    if (seenNames.has(bear.name)) return false;
    seenNames.add(bear.name);
    return true;
  });

  const moreBears = document.querySelector('.more_bears');
  uniqueBears.forEach((bear) => {
    const html = '<div class="bear">' +
      '<img src="' + bear.image + '" alt="Image of ' + bear.name + '" style="width:200px; height:auto;">' +
      '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
      '<p>Range: ' + bear.range + '</p>' +
      '</div>';
    moreBears.innerHTML += html;
  });
}

function showBearsError(message) {
  const moreBears = document.querySelector('.more_bears');
  const errorPara = document.createElement('p');
  errorPara.className = 'error-message';
  errorPara.textContent = message;
  moreBears.appendChild(errorPara);
}

export async function loadBears() {
  const params = {
    action: "parse",
    page: title,
    prop: "wikitext",
    section: 3,
    format: "json",
    origin: "*"
  };

  try {
    const res = await fetch(baseUrl + "?" + new URLSearchParams(params).toString());
    if (!res.ok) {
      throw new Error('Wikipedia API responded with status ' + res.status);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.info || 'Wikipedia API returned an error');
    }
    if (!data.parse || !data.parse.wikitext) {
      throw new Error('Unexpected response shape from Wikipedia API');
    }

    await extractBears(data.parse.wikitext['*']);
  } catch (error) {
    console.error('Failed to load bear data:', error);
    showBearsError('Sorry, the bear data could not be loaded right now. Please try again later.');
  }
}
