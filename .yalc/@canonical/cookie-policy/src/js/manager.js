import {
  setCookie,
  getContent,
  setGoogleConsentPreferences,
  setGoogleConsentFromControls,
  setupAccordion,
} from "./utils.js";
import { Control } from "./control.js";
import { controlsContent } from "./content.js";

export class Manager {
  constructor(container, destroyComponent) {
    this.container = container;
    this.controlsStore = [];
    this.destroyComponent = destroyComponent;
  }

  getManagerMarkup(language) {
    const managerContent = getContent(language).manager;
    const manager = `
      <div class="p-modal cookie-manager-modal" id="modal">
        <section class="p-modal__dialog" role="dialog" aria-labelledby="cookie-policy-title" aria-describedby="cookie-policy-content">
          <header class="p-modal__header">
            <h2 class="p-modal__title p-heading--4" id="cookie-policy-title">${managerContent.title}</h2>
          </header>
          <div id="cookie-policy-content">
            <p>${managerContent.body1}</p>
            <p>${managerContent.body2}</p>
            ${managerContent.body3 ? `<p>${managerContent.body3}</p>` : ''}
            <aside class="p-accordion">
              <ul class="p-accordion__list controls">
              </ul>
            </aside>
            <p class="u-no-margin--bottom u-float-right">
              <button class="p-button--positive js-close" id="cookie-policy-button-accept-all">${managerContent.acceptAll}</button>
              <button class="p-button js-save-preferences">${managerContent.SavePreferences}</button>
            </p>
          </div>
        </section>
      </div>`;

    return manager;
  }

  render(language) {
    this.container.innerHTML = this.getManagerMarkup(language);
    const controlsContainer = this.container.querySelector(".controls");
    controlsContent.forEach((controlDetails) => {
      const control = new Control(
        { ...controlDetails, onChange: () => this.updateAcceptButton() },
        controlsContainer,
        language
      );
      this.controlsStore.push(control);
    });
    this.updateAcceptButton();
    this.initaliseListeners();
  }

  updateAcceptButton() {
    const allChecked = this.controlsStore
      .filter((control) => control.getId() !== "essential")
      .every((control) => control.isChecked());
    const button = this.container.querySelector(".js-close");
    button.style.display = allChecked ? "none" : "inline-block";
  }

  initaliseListeners() {
    this.container.querySelector(".js-close").addEventListener("click", () => {
      setCookie("all");
      setGoogleConsentPreferences("all");
      this.destroyComponent();
    });
    
    // Setup all accordions on the page
    let accordions = document.querySelectorAll('.p-accordion');
    for (let i = 0, l = accordions.length; i < l; i++) {
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