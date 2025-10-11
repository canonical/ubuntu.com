import {
  getContent,
  storeCookiesPreferences
} from "./utils.js";
import { Control } from "./control.js";
import { controlsContent } from "./content.js";

export class Manager {
  constructor(container, destroyComponent, sessionParams = null) {
    this.container = container;
    this.controlsStore = [];
    this.destroyComponent = destroyComponent;
    this.sessionParams = sessionParams;
  }

  getManagerMarkup(language) {
    const managerContent = getContent(language).manager;
    const manager = `
    <div class="p-modal" id="modal">
    <div class="p-modal__dialog" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description">
      <header class="p-modal__header">
        <h2 class="p-modal__title" id="modal-title">${managerContent.title}</h2>
      </header>
      <p id="modal-description">${managerContent.body1}</p>
      <p>${managerContent.body2}</p>
      <p>${managerContent.body3}</p>
      <p>${managerContent.body4}</p>
      <p><button class="p-button--positive u-no-margin--bottom js-close">${managerContent.acceptAll}</button></p>
      <p>${managerContent.acceptAllHelp}</p>
      <hr />
      <div class="controls"></div>
      <button class="p-button js-save-preferences">${managerContent.savePreferences}</button>
    </div>
  </div>`;

    return manager;
  }

  render(language) {
    this.container.innerHTML = this.getManagerMarkup(language);
    const controlsContainer = this.container.querySelector(".controls");
    controlsContent.forEach((controlDetails) => {
      const control = new Control(controlDetails, controlsContainer, language);
      this.controlsStore.push(control);
    });
    this.initaliseListeners();
  }

  initaliseListeners() {
    this.container
      .querySelector(".js-close")
      .addEventListener("click", async () => {
        await this.handleAcceptAll();
      });

    this.container
      .querySelector(".js-save-preferences")
      .addEventListener("click", async () => {
        await this.handleSavePreferences();
        // this.destroyComponent();
      });
  }

  async handleAcceptAll() {
    // And if we don't have a session??
    const preference = "all";

    // If we have session parameters, save to server and session
    storeCookiesPreferences(this.sessionParams, preference);

    this.destroyComponent();
  }

  async handleSavePreferences() {
    const checkedControls = this.controlsStore.filter((control) =>
      control.isChecked()
    );

    let preference;
    if (this.controlsStore.length === checkedControls.length) {
      preference = "all";
    } else {
      // Get the last checked control's preference
      const lastCheckedControl = checkedControls[checkedControls.length - 1];
      preference = lastCheckedControl
        ? lastCheckedControl.getId()
        : "essential";
    }

    // If we have session parameters, save to server and session
    storeCookiesPreferences(this.sessionParams, preference, this.controlsStore);

    this.destroyComponent();
  }
}
