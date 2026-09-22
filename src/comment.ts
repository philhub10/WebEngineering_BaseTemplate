// Show/hide comments toggle
export function initCommentToggle(): void {
  const showHideBtn = document.querySelector<HTMLDivElement>('.show-hide');
  const commentWrapper = document.querySelector<HTMLDivElement>('.comment-wrapper');
  if (!showHideBtn || !commentWrapper) {
    throw new Error('Comment toggle elements not found');
  }

  commentWrapper.style.display = 'none';

  showHideBtn.onclick = () => {
    const showHideText = showHideBtn.textContent;
    if (showHideText === 'Show comments') {
      showHideBtn.textContent = 'Hide comments';
      commentWrapper.style.display = 'block';
    } else {
      showHideBtn.textContent = 'Show comments';
      commentWrapper.style.display = 'none';
    }
  };
}

// Comment form stuff
export function initCommentForm(): void {
  const commentForm = document.querySelector<HTMLFormElement>('.comment-form');
  const nameField = document.querySelector<HTMLInputElement>('#name');
  const commentField = document.querySelector<HTMLInputElement>('#comment');
  const commentList = document.querySelector<HTMLUListElement>('.comment-container');
  if (!commentForm || !nameField || !commentField || !commentList) {
    throw new Error('Comment form elements not found');
  }

  commentForm.onsubmit = (e) => {
    e.preventDefault();

    const listItem = document.createElement('li');
    const namePara = document.createElement('p');
    const commentPara = document.createElement('p');

    namePara.textContent = nameField.value;
    commentPara.textContent = commentField.value;

    listItem.appendChild(namePara);
    listItem.appendChild(commentPara);
    commentList.appendChild(listItem);

    nameField.value = '';
    commentField.value = '';
  };
}
