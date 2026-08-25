/* Unit tests for the reusable filter-menu component (static/js/src/filter-menu.js).
 *
 * filter-menu.js is a self-invoking module that wires up event listeners
 * against the DOM on load, so each test mounts a static fixture and mocks
 * window.location before loading the module fresh. This keeps the tests fully
 * isolated from any page or API.
 */

function singleMenu({ param, label, options }) {
  const menuId = `${param}-menu`;
  const optionButtons = options
    .map(
      (o) =>
        `<button type="button" class="p-contextual-menu__link p-filter-menu__link" data-value="${o.value}">${o.label}</button>`,
    )
    .join("");
  return `
    <span class="p-filter-menu">
      <button type="button"
              class="p-filter-menu__toggle"
              aria-controls="${menuId}"
              aria-expanded="false"
              data-filter-param="${param}"
              data-filter-type="single"
              data-default-label="${label}">
        <span>${label}</span>
      </button>
      <span id="${menuId}" aria-hidden="true">
        <span class="p-contextual-menu__group">${optionButtons}</span>
      </span>
    </span>
  `;
}

function multiMenu({ param, label, options }) {
  const menuId = `${param}-menu`;
  const checkboxes = options
    .map(
      (o) => `
        <label class="p-checkbox p-filter-menu__option">
          <input type="checkbox" class="p-filter-menu__checkbox" data-filter-option value="${o.value}" />
          <span class="p-checkbox__label"><span class="p-filter-menu__label-text">${o.label}</span></span>
        </label>`,
    )
    .join("");
  return `
    <span class="p-filter-menu">
      <button type="button"
              class="p-filter-menu__toggle p-filter-menu__toggle--multi"
              aria-controls="${menuId}"
              aria-expanded="false"
              data-filter-param="${param}"
              data-filter-type="multi"
              data-default-label="${label}">
        <span>${label}</span><span class="p-filter-menu__count" data-filter-count hidden>0</span>
      </button>
      <span id="${menuId}" aria-hidden="true">
        <span class="p-filter-menu__group p-filter-menu__group--multi">${checkboxes}</span>
        <span class="p-filter-menu__actions">
          <button type="button" data-filter-select-all>Select all</button>
          <button type="button" data-filter-clear-selection>Clear</button>
        </span>
      </span>
    </span>
  `;
}

function bar({ menus, resetParams, id } = {}) {
  const reset = resetParams ? ` data-filter-reset-params="${resetParams}"` : "";
  const barId = id ? ` id="${id}"` : "";
  return `
    <div class="u-hide"${barId} data-js-filters${reset}>
      <form>
        ${menus.join("")}
        <button type="button" data-filter-submit>Apply</button>
        <button type="button" class="u-hide" data-filter-clear>Clear filters</button>
      </form>
    </div>
  `;
}

function setLocation(url) {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: url,
  });
}

function loadFilterMenu(url, html) {
  setLocation(url);
  document.body.innerHTML = html;
  jest.isolateModules(() => {
    require("./filter-menu.js");
  });
}

function toggle(param) {
  return document.querySelector(`[data-filter-param="${param}"]`);
}

function toggleLabel(param) {
  return toggle(param).querySelector("span").textContent;
}

function clearButton(scope = document) {
  return scope.querySelector("[data-filter-clear]");
}

const RESOURCE_MENU = {
  param: "resource",
  label: "Resource type",
  options: [
    { value: "all", label: "All resource types" },
    { value: "webinar", label: "Webinar" },
  ],
};

const TAG_MENU = {
  param: "tag",
  label: "Tag",
  options: [
    { value: "cloud", label: "cloud" },
    { value: "security", label: "security" },
  ],
};

describe("filter-menu on load", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("removes u-hide from each [data-js-filters] bar", () => {
    loadFilterMenu(
      "http://localhost/engage",
      bar({ menus: [singleMenu(RESOURCE_MENU)] }),
    );

    const filterBar = document.querySelector("[data-js-filters]");
    expect(filterBar.classList.contains("u-hide")).toBe(false);
  });

  it("removes u-hide from every bar when multiple are present", () => {
    loadFilterMenu(
      "http://localhost/page",
      bar({ id: "bar-a", menus: [singleMenu(RESOURCE_MENU)] }) +
        bar({ id: "bar-b", menus: [multiMenu(TAG_MENU)] }),
    );

    expect(
      document.getElementById("bar-a").classList.contains("u-hide"),
    ).toBe(false);
    expect(
      document.getElementById("bar-b").classList.contains("u-hide"),
    ).toBe(false);
  });
});

describe("filter-menu clear behaviour", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("only resets a single-select in place when no query has been submitted", () => {
    loadFilterMenu(
      "http://localhost/engage",
      bar({ menus: [singleMenu(RESOURCE_MENU)], resetParams: "page" }),
    );

    document.querySelector('#resource-menu [data-value="webinar"]').click();

    expect(toggleLabel("resource")).toBe("Webinar");
    expect(toggle("resource").dataset.selectedValue).toBe("webinar");
    expect(clearButton().classList.contains("u-hide")).toBe(false);

    clearButton().click();

    expect(window.location).toBe("http://localhost/engage");
    expect(toggleLabel("resource")).toBe("Resource type");
    expect(toggle("resource").dataset.selectedValue).toBeUndefined();
    expect(clearButton().classList.contains("u-hide")).toBe(true);
  });

  it("clears a multi-select in place when no query has been submitted", () => {
    loadFilterMenu(
      "http://localhost/engage",
      bar({ menus: [multiMenu(TAG_MENU)], resetParams: "page" }),
    );

    const cloud = document.querySelector('[value="cloud"]');
    cloud.checked = true;
    cloud.dispatchEvent(new Event("change", { bubbles: true }));

    expect(clearButton().classList.contains("u-hide")).toBe(false);

    clearButton().click();

    expect(window.location).toBe("http://localhost/engage");
    expect(cloud.checked).toBe(false);
    expect(clearButton().classList.contains("u-hide")).toBe(true);
  });

  it("navigates and removes params when a query has already been submitted", () => {
    loadFilterMenu(
      "http://localhost/engage?resource=webinar&page=3",
      bar({ menus: [singleMenu(RESOURCE_MENU)], resetParams: "page" }),
    );

    expect(clearButton().classList.contains("u-hide")).toBe(false);

    clearButton().click();

    expect(window.location).not.toBe(
      "http://localhost/engage?resource=webinar&page=3",
    );
    const navigated = new URL(window.location);
    expect(navigated.searchParams.has("resource")).toBe(false);
    expect(navigated.searchParams.has("page")).toBe(false);
  });
});

describe("filter-menu is agnostic to param keys, order and quantity", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("wires up menus with arbitrary param keys and builds the submit URL from them", () => {
    loadFilterMenu(
      "http://localhost/catalog",
      bar({
        menus: [
          multiMenu({
            param: "category",
            label: "Category",
            options: [
              { value: "books", label: "Books" },
              { value: "toys", label: "Toys" },
            ],
          }),
          singleMenu({
            param: "sort",
            label: "Sort",
            options: [
              { value: "all", label: "Any" },
              { value: "price", label: "Price" },
            ],
          }),
        ],
      }),
    );

    document.querySelector('#sort-menu [data-value="price"]').click();
    const books = document.querySelector('[value="books"]');
    books.checked = true;
    books.dispatchEvent(new Event("change", { bubbles: true }));

    document.querySelector("[data-filter-submit]").click();

    const navigated = new URL(window.location);
    expect(navigated.searchParams.get("sort")).toBe("price");
    expect(navigated.searchParams.getAll("category")).toEqual(["books"]);
  });

  it("restores selection from the URL regardless of the param name", () => {
    loadFilterMenu(
      "http://localhost/catalog?sort=price&category=toys",
      bar({
        menus: [
          singleMenu({
            param: "sort",
            label: "Sort",
            options: [
              { value: "all", label: "Any" },
              { value: "price", label: "Price" },
            ],
          }),
          multiMenu({
            param: "category",
            label: "Category",
            options: [
              { value: "books", label: "Books" },
              { value: "toys", label: "Toys" },
            ],
          }),
        ],
      }),
    );

    expect(toggleLabel("sort")).toBe("Price");
    expect(document.querySelector('[value="toys"]').checked).toBe(true);
    expect(clearButton().classList.contains("u-hide")).toBe(false);
  });

  it("operates two independent filter bars separately", () => {
    loadFilterMenu(
      "http://localhost/page",
      bar({ id: "bar-a", menus: [singleMenu(RESOURCE_MENU)] }) +
        bar({ id: "bar-b", menus: [multiMenu(TAG_MENU)] }),
    );

    const barA = document.getElementById("bar-a");
    const barB = document.getElementById("bar-b");

    // Select within bar A only.
    barA.querySelector('#resource-menu [data-value="webinar"]').click();

    // Bar A's clear button shows; bar B's stays hidden.
    expect(clearButton(barA).classList.contains("u-hide")).toBe(false);
    expect(clearButton(barB).classList.contains("u-hide")).toBe(true);
  });
});
