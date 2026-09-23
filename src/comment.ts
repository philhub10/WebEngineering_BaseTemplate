// Show/hide comments toggle
export function initCommentToggle(): void {
  const showHideBtn = document.querySelector<HTMLDivElement>('.show-hide');
  const commentWrapper =
    document.querySelector<HTMLDivElement>('.comment-wrapper');
  if (showHideBtn === null || commentWrapper === null) {
    throw new Error('Comment toggle elements not found');
  }

  commentWrapper.style.display = 'none';

  showHideBtn.onclick = () => {
    const { textContent: showHideText } = showHideBtn;
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
  const commentList =
    document.querySelector<HTMLUListElement>('.comment-container');
  if (
    commentForm === null ||
    nameField === null ||
    commentField === null ||
    commentList === null
  ) {
    throw new Error('Comment form elements not found');
  }

  commentForm.onsubmit = (e) => {
    e.preventDefault();

    const listItem = document.createElement('li');
    const namePara = document.createElement('p');
    const commentPara = document.createElement('p');

    const { value: name } = nameField;
    const { value: comment } = commentField;
    namePara.textContent = name;
    commentPara.textContent = comment;

    listItem.appendChild(namePara);
    listItem.appendChild(commentPara);
    commentList.appendChild(listItem);

    nameField.value = '';
    commentField.value = '';
  };
}
