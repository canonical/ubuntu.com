import { getControlsContent, getCookie } from "./utils.js";

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
    control.innerHTML = `
    <li class="controls p-accordion__group">                
      <div role="heading" aria-level="3" class="p-accordion__heading">
        <button type="button" class="p-accordion__tab" id="${this.id}-tab" aria-controls="${this.id}-section" aria-expanded="false">
          <span class="p-heading--5">${this.title}</span>
          ${
            !this.enableSwitcher ? 
            `<p class="u-text--muted u-float-right u-no-margin--bottom u-no-padding--top">Always active</p>` : `
            ${
            `<label class="u-float-right u-no-margin--bottom p-switch">
              <input type="checkbox" class="p-switch__input js-${this.id}-switch" ${
                  (isChecked || !this.enableSwitcher) && 'checked="" '
                }
                ${
                  !this.enableSwitcher && `disabled="disabled"`

                }>            
              <span class="p-switch__slider"></span>
            </label>
            `
          }
        `}
        </button>
        
      </div>
      <section class="p-accordion__panel" id="${this.id}-section" aria-hidden="true" aria-labelledby="${this.id}-tab">
        <p>${this.description}</p>
      </section>
    </li>
    <hr class="p-rule--muted"/>
    `;
    this.container.appendChild(control);
    this.element = control.querySelector(`.js-${this.id}-switch`);
  }

  cookieIsTrue() {
    const cookieValue = getCookie("_cookies_accepted");

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
