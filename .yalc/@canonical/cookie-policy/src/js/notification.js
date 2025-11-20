import {
  handleClose,
  getContent,
  getCookie,
  setCookie,
  setGoogleConsentPreferences,
} from "./utils.js";

export class Notification {
  constructor(container, renderManager, destroyComponent) {
    this.container = container;
    this.renderManager = renderManager;
    this.destroyComponent = destroyComponent;
  }

  getNotificationMarkup(language) {
    const notificationContent = getContent(language).notification;
    const notification = `
      <div class="p-modal cookie-notification-modal" id="modal">
        <div class="p-modal__dialog" role="dialog" aria-labelledby="cookie-policy-title" aria-describedby="cookie-policy-content">
        <header class="p-modal__header grid-row">
          <h2 class="p-modal__title p-heading--4" id="cookie-policy-title">${notificationContent.title}</h2>
        </header>
        <div id="cookie-policy-content" class="grid-row">
          <div class="grid-col-5">
            <p class="u-no-max-width${notificationContent.body2 ? ' u-no-margin--bottom' : ''}">${notificationContent.body1}</p>
            ${notificationContent.body2 ? `<p class="u-no-max-width">${notificationContent.body2}</p> ` : ''}
          </div>
          <div class="cookie-notification-buttons grid-col-3 u-vertically-center">
            <p class="u-no-margin--bottom">
              <button class="p-button--link is-inline js-manage">${notificationContent.buttonManage}</button>
              <button class="p-button--positive js-close-all" id="cookie-policy-button-accept-all">${notificationContent.buttonAcceptAll}</button>
            </p>
          </div>
        </div>`;

    return notification;
  }

  render(language) {
    this.container.innerHTML = this.getNotificationMarkup(language);
    if (!getCookie()) {
      setCookie("essential");
      setGoogleConsentPreferences("essential");
    }
    this.initaliseListeners();
  }

  initaliseListeners() {
    this.container
      .querySelector(".js-close-all")
      .addEventListener("click", handleClose("all", this.destroyComponent));

    this.container
      .querySelector(".js-manage")
      .addEventListener("click", () => {
        this.renderManager();
      });
  }
}
