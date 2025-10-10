import { getControlsContent, getCookiesAcceptedCookie } from "./utils.js";

export class Control {
  constructor(details, container, language) {
    this.language = language;
    this.id = details.id;
    this.title = getControlsContent(details, language).title;
    this.description = getControlsContent(details, language).description;
    this.enableSwitcher = details.enableSwitcher;
    this.container = container;
    this.element;

    // Rendering off the bat here as this is a dumb component.
    // It saves creating a variable and calling .render() on it.
    this.render();
  }

  render() {
    const isChecked = this.cookieIsTrue();

    const control = document.createElement("div");
    control.classList.add("u-sv3");
    control.innerHTML = `
      ${`<label class="u-float-right p-switch">
          <input type="checkbox" class="p-switch__input js-${this.id}-switch" ${
        (isChecked || !this.enableSwitcher) && 'checked="" '
      }
            ${!this.enableSwitcher && `disabled="disabled"`}>
          <span class="p-switch__slider"></span>
        </label>`}
      <h4>${this.title}</h4>
      <p>${this.description}</p>`;
    this.container.appendChild(control);
    this.element = control.querySelector(`.js-${this.id}-switch`);
  }

  cookieIsTrue() {
    const cookieValue = getCookiesAcceptedCookie();

    // If the cookie value matches the control ID, return true
    if (cookieValue) {
      if (cookieValue === this.id || cookieValue === "all") {
        return true;
      }
    }
    return cookieValue && cookieValue === this.id;
  }

  // The check should be false by default
  isChecked() {
    return this.element ? this.element.checked : false;
  }

  getId() {
    return this.id;
  }
}
