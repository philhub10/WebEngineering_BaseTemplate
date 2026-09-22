// Search highlighter
export function initSearchHighlighter(): void {
  const searchForm = document.querySelector<HTMLFormElement>('.search');
  if (!searchForm) {
    throw new Error('Search form not found');
  }

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    document.querySelectorAll('.highlight').forEach((el) => {
      const parent = el.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(el.textContent || ''), el);
      parent.normalize();
    });

    const queryField = searchForm.querySelector<HTMLInputElement>('input[name="q"]');
    if (!queryField) {
      throw new Error('Search input not found');
    }
    const searchKey = queryField.value.trim();
    if (!searchKey) return;

    const regex = new RegExp('(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');

    const walk = (node: Node): void => {
      if (node.nodeType === 3) { // Text node
        const match = node.nodeValue?.match(regex);
        if (match) {
          const span = document.createElement('span');
          span.innerHTML = (node.nodeValue || '').replace(regex, '<mark class="highlight">$1</mark>');
          (node as ChildNode).replaceWith(...Array.from(span.childNodes));
        }
      } else if (node.nodeType === 1 && (node as Element).tagName !== 'SCRIPT' && (node as Element).tagName !== 'STYLE' && (node as Element).tagName !== 'FORM') {
        node.childNodes.forEach(walk);
      }
    };

    const article = document.querySelector<HTMLElement>('article');
    if (!article) {
      throw new Error('Article element not found');
    }
    walk(article);
  });
}
