import {
  getContent,
  storeCookiesPreferences
} from "./utils.js";

export class Notification {
  constructor(
    container,
    renderManager,
    destroyComponent,
    sessionParams = null
  ) {
    this.container = container;
    this.renderManager = renderManager;
    this.destroyComponent = destroyComponent;
    this.sessionParams = sessionParams;
  }

  getNotificationMarkup(language) {
    const notificationContent = getContent(language);
    const notification = `
      <div class="p-modal" id="modal">
        <div class="p-modal__dialog" role="dialog" aria-labelledby="cookie-policy-title" aria-describedby="cookie-policy-content">
        <header class="p-modal__header">
          <h2 class="p-modal__title" id="cookie-policy-title">${notificationContent.notification.title}</h2>
        </header>
        <div id="cookie-policy-content">
          <p>${notificationContent.notification.body1}</p>
          <p>${notificationContent.notification.body2}</p>
          <p>${notificationContent.notification.body3}</p>
          <p class="u-no-margin--bottom">
            <button class="p-button--positive js-close" id="cookie-policy-button-accept">${notificationContent.notification.buttonAccept}</button>
            <button class="p-button js-manage">${notificationContent.notification.buttonManage}</button>
          </p>
        </div>
      </div>`;

    return notification;
  }

  render(language) {
    this.container.innerHTML = this.getNotificationMarkup(language);
    this.initaliseListeners();
  }

  initaliseListeners() {
    this.container
      .querySelector(".js-close")
      .addEventListener("click", async (e) => {
        await this.handleAcceptAll();
      });
    this.container
      .querySelector(".js-manage")
      .addEventListener("click", (e) => {
        this.renderManager();
      });
  }

  async handleAcceptAll() {
    const preference = "all";

    // If we have session parameters, save to server and session
    storeCookiesPreferences(this.sessionParams, preference);

    this.destroyComponent();
  }
}
