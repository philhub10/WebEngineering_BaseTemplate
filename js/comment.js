// Show/hide comments toggle
export function initCommentToggle() {
  var showHideBtn = document.querySelector('.show-hide');
  var commentWrapper = document.querySelector('.comment-wrapper');

  commentWrapper.style.display = 'none';

  showHideBtn.onclick = function() {
    var showHideText = showHideBtn.textContent;
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
  var form = document.querySelector('.comment-form');
  var nameField = document.querySelector('#name');
  var commentField = document.querySelector('#comment');
  var list = document.querySelector('.comment-container');

  form.onsubmit = function(e) {
    e.preventDefault();

    var listItem = document.createElement('li');
    var namePara = document.createElement('p');
    var commentPara = document.createElement('p');
    var nameValue = nameField.value;
    var commentValue = commentField.value;

    namePara.textContent = nameValue;
    commentPara.textContent = commentValue;

    console.log(nameValue);

    list.appendChild(listItem);
    listItem.appendChild(namePara);
    listItem.appendChild(commentPara);

    nameField.value = '';
    commentField.value = '';
  };
}
