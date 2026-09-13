// Fetching bear data
var baseUrl = "https://en.wikipedia.org/w/api.php";
var title = "List_of_ursids";

var PLACEHOLDER_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
  '<rect width="100%" height="100%" fill="#ddd"/>' +
  '<text x="50%" y="50%" font-family="Arial" font-size="14" fill="#666" text-anchor="middle" dominant-baseline="middle">No image available</text>' +
  '</svg>'
);

function fetchImageUrl(fileName) {
  var imageParams = {
    action: "query",
    titles: "File:" + fileName,
    prop: "imageinfo",
    iiprop: "url",
    format: "json",
    origin: "*"
  };

  var url = baseUrl + "?" + new URLSearchParams(imageParams).toString();
  return fetch(url).then(function(res) {
    return res.json();
  }).then(function(data) {
    var pages = data.query.pages;
    var page = Object.values(pages)[0];
    if (!page.imageinfo || !page.imageinfo[0]) {
      return PLACEHOLDER_IMAGE;
    }
    return page.imageinfo[0].url;
  }).catch(function() {
    return PLACEHOLDER_IMAGE;
  });
}

function extractBears(wikitext) {
  var speciesTables = wikitext.split('{{Species table/end}}');
  var bearPromises = [];

  speciesTables.forEach(function(table) {
    var rows = table.split('{{Species table/row');
    rows.forEach(function(row) {
      var nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
      var binomialMatch = row.match(/\|binomial=(.*?)\n/);
      var imageMatch = row.match(/\|image=(.*?)\n/);
      var rangeMatch = row.match(/\|range=(.*?)\s*\|/);

      if (nameMatch && binomialMatch && imageMatch) {
        var fileName = imageMatch[1].trim().replace('File:', '');

        bearPromises.push(
          fetchImageUrl(fileName).then(function(imageUrl) {
            return {
              name: nameMatch[1],
              binomial: binomialMatch[1],
              image: imageUrl,
              range: rangeMatch ? rangeMatch[1].replace(/\s*\([^)]*\)/g, '').trim() : 'Unknown'
            };
          })
        );
      }
    });
  });

  Promise.all(bearPromises).then(function(bears) {
    var seenNames = new Set();
    var uniqueBears = bears.filter(function(bear) {
      if (seenNames.has(bear.name)) return false;
      seenNames.add(bear.name);
      return true;
    });

    var moreBears = document.querySelector('.more_bears');
    uniqueBears.forEach(function(bear) {
      var html = '<div class="bear">' +
        '<img src="' + bear.image + '" alt="Image of ' + bear.name + '" style="width:200px; height:auto;">' +
        '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
        '<p>Range: ' + bear.range + '</p>' +
        '</div>';
      moreBears.innerHTML += html;
    });
  });
}

export function loadBears() {
  var params = {
    action: "parse",
    page: title,
    prop: "wikitext",
    section: 3,
    format: "json",
    origin: "*"
  };

  fetch(baseUrl + "?" + new URLSearchParams(params).toString())
    .then(function(res) { return res.json(); })
    .then(function(data) {
      extractBears(data.parse.wikitext['*']);
    });
}
