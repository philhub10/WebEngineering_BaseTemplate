// Search highlighter
export function initSearchHighlighter(): void {
  const searchForm = document.querySelector<HTMLFormElement>('.search');
  if (searchForm === null) {
    throw new Error('Search form not found');
  }

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    document.querySelectorAll('.highlight').forEach((el) => {
      const { parentNode: parent } = el;
      if (parent === null) return;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });

    const queryField =
      searchForm.querySelector<HTMLInputElement>('input[name="q"]');
    if (queryField === null) {
      throw new Error('Search input not found');
    }
    const searchKey = queryField.value.trim();
    if (searchKey === '') return;

    const escapedKey = searchKey.replace(/[.*+?^$\{\}\(\)\|\[\]\\]/gv, '\\$&');
    const regex = new RegExp(`(${escapedKey})`, 'giv');

    const walk = (node: Node): void => {
      if (node instanceof Text) {
        const text = node.nodeValue ?? '';
        const match = text.match(regex);
        if (match !== null) {
          const span = document.createElement('span');
          span.innerHTML = text.replace(
            regex,
            '<mark class="highlight">$1</mark>'
          );
          node.replaceWith(...Array.from(span.childNodes));
        }
      } else if (
        node instanceof Element &&
        node.tagName !== 'SCRIPT' &&
        node.tagName !== 'STYLE' &&
        node.tagName !== 'FORM'
      ) {
        node.childNodes.forEach(walk);
      }
    };

    const article = document.querySelector<HTMLElement>('article');
    if (article === null) {
      throw new Error('Article element not found');
    }
    walk(article);
  });
}
