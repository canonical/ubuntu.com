import {
  setCookie,
  getContent,
  setGoogleConsentPreferences,
  setGoogleConsentFromControls,
  setupAccordion,
} from "./utils.js";
import { Control } from "./control.js";
import { controlsContent } from "./content.js";

export class Notification {
  constructor(container, destroyComponent) {
    this.container = container;
    this.destroyComponent = destroyComponent;
    this.controlsStore = [];
  }

  getNotificationMarkup(language) {
    const notificationContent = getContent(language);
    const notification = `
      <div class="p-modal" id="modal">
        <section class="p-modal__dialog" role="dialog" aria-labelledby="cookie-policy-title" aria-describedby="cookie-policy-content">
          <header class="p-modal__header">
            <h2 class="p-modal__title p-heading--4" id="cookie-policy-title">${notificationContent.notification.title}</h2>
          </header>
          <div id="cookie-policy-content">
            <p>${notificationContent.notification.body1}</p>
            <p>${notificationContent.notification.body2}</p>
            ${notificationContent.body3 ? `<p>${notificationContent.body3}</p>` : ''}
            <aside class="p-accordion">
              <ul class="p-accordion__list controls">
              </ul>
            </aside>
            <p class="u-no-margin--bottom u-float-right">
              <button class="p-button--positive js-close" id="cookie-policy-button-accept">${notificationContent.notification.buttonAccept}</button>
              <button class="p-button js-save-preferences">${notificationContent.notification.buttonSave}</button>
            </p>
          </div>
        </section>
      </div>`;

    return notification;
  }

  render(language) {
    this.container.innerHTML = this.getNotificationMarkup(language);
    const controlsContainer = this.container.querySelector(".controls");
    controlsContent.forEach((controlDetails) => {
      const control = new Control(controlDetails, controlsContainer, language);
      this.controlsStore.push(control);
    });
    this.initaliseListeners();
  }

  initaliseListeners() {
    this.container.querySelector(".js-close").addEventListener("click", (e) => {
      setCookie("all");
      setGoogleConsentPreferences("all");
      this.destroyComponent();
    });
    
    // Setup all accordions on the page
    var accordions = document.querySelectorAll('.p-accordion');
    for (var i = 0, l = accordions.length; i < l; i++) {
      setupAccordion(accordions[i]);
    }
    
    this.container
      .querySelector(".js-save-preferences")
      .addEventListener("click", () => {
        this.savePreferences();
        this.destroyComponent();
      });
  }

  savePreferences() {
    const checkedControls = this.controlsStore.filter((control) =>
      control.isChecked()
    );

    // "essential" is the default value for only essential cookies
    if (this.controlsStore.length - 1 === checkedControls.length) {
      setCookie("all");
    } else if (checkedControls.length === 0) {
      setCookie("essential");
    } else {
      this.controlsStore.forEach((control) => {
        if (control.isChecked()) {
          // Note: this overwrites the previous cookie
          setCookie(control.getId());
        }
      });
    }

    setGoogleConsentFromControls(this.controlsStore);
  }

}
