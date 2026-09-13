// Show/hide comments toggle
export function initCommentToggle() {
  const showHideBtn = document.querySelector('.show-hide');
  const commentWrapper = document.querySelector('.comment-wrapper');

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
export function initCommentForm() {
  const commentForm = document.querySelector('.comment-form');
  const nameField = document.querySelector('#name');
  const commentField = document.querySelector('#comment');
  const commentList = document.querySelector('.comment-container');

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
