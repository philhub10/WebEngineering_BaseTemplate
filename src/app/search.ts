// Search highlighter
export function highlightArticleMatches(query: string): void {
  document.querySelectorAll('.highlight').forEach((el) => {
    const { parentNode: parent } = el;
    if (parent === null) return;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });

  const searchKey = query.trim();
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
}
