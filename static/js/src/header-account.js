var accountContainer = document.querySelector('.js-account');
if (accountContainer) {
  fetch('/account.json')
    .then(response => response.json())
    .then(data => {
      if (data.account === null) {
        accountContainer.innerHTML = '<a href="/login" class="p-navigation__link-anchor">Sign in</a>';
      } else {
        accountContainer.innerHTML = `<div class="p-navigation__link-anchor">${data.account.fullname}</a>`;
      }
    });
}
