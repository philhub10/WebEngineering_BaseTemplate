// Search highlighter
export function initSearchHighlighter() {
  document.querySelector('.search').addEventListener('submit', function(e) {
    e.preventDefault();

    document.querySelectorAll('.highlight').forEach((el) => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });

    const searchKey = this.q.value.trim();
    if (!searchKey) return;

    const regex = new RegExp('(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');

    const walk = (node) => {
      if (node.nodeType === 3) { // Text node
        const match = node.nodeValue.match(regex);
        if (match) {
          const span = document.createElement('span');
          span.innerHTML = node.nodeValue.replace(regex, '<mark class="highlight">$1</mark>');
          node.replaceWith.apply(node, span.childNodes);
        }
      }
      else if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'FORM') {
        node.childNodes.forEach(walk);
      }
    };

    walk(document.querySelector('article'));
  });
}
