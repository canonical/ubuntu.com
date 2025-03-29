const baseURL = 'http://localhost:8001';
var timeout = 1000;
const acceptCookies = () => {
  const cookieBanner = document.querySelector(".cookie-policy");
  if (cookieBanner) {
    const acceptButton = cookieBanner.querySelector("#cookie-policy-button-accept");
    if (acceptButton) {
      acceptButton.click();
    }
  }
};

module.exports = [
  {
    name: '/',
    url: baseURL,
    waitForTimeout: timeout,
    execute: {
      beforeSnapshot: acceptCookies,
    }
  },
  {
    name: '/download/desktop',
    url: baseURL+'/download/desktop',
    waitForTimeout: timeout,
    execute: {
      beforeSnapshot: acceptCookies,
    }
  }
];
