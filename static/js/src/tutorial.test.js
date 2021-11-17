import { toggleTutorialNavigation, setActiveLink } from "./tutorial.js";

describe("toggleTutorialNavigation", () => {
  it("toggles menu classes`", () => {
    // Set up DOM elements
    document.body.innerHTML = `
      <div class="l-tutorial__nav-toggle p-icon--menu" aria-controls="menu-tutorial">Toggle</div>
      <div id="menu-tutorial" class="l-tutorial__nav u-hide--small">Nav</div>
    `;

    toggleTutorialNavigation();

    expect(
      document
        .querySelector(".l-tutorial__nav-toggle")
        .classList.contains("p-icon--menu")
    ).toBe(false);
    expect(
      document
        .querySelector(".l-tutorial__nav-toggle")
        .classList.contains("p-icon--close")
    ).toBe(true);
    expect(
      document
        .querySelector(".l-tutorial__nav")
        .classList.contains("u-hide--small")
    ).toBe(false);

    toggleTutorialNavigation();

    expect(
      document
        .querySelector(".l-tutorial__nav-toggle")
        .classList.contains("p-icon--menu")
    ).toBe(true);
    expect(
      document
        .querySelector(".l-tutorial__nav-toggle")
        .classList.contains("p-icon--close")
    ).toBe(false);
    expect(
      document
        .querySelector(".l-tutorial__nav")
        .classList.contains("u-hide--small")
    ).toBe(true);
  });
});

describe("setActiveLink", () => {
  it("sets correct link as active", () => {
    // Set up DOM elements
    document.body.innerHTML = `
      <ul>
        <li class="l-tutorial__nav-item">
          <a class="l-tutorial__nav-link" href="#1">Link 1</a>
        </li>
        <li class="l-tutorial__nav-item">
          <a class="l-tutorial__nav-link" href="#2">Link 2</a>
        </li>
      </ul>
    `;

    const navigationItems = document.querySelectorAll(".l-tutorial__nav-item");

    setActiveLink(navigationItems, "#1");

    expect(navigationItems[0].classList.contains("is-active")).toBe(true);
    expect(navigationItems[1].classList.contains("is-active")).toBe(false);

    setActiveLink(navigationItems, "#2");

    expect(navigationItems[0].classList.contains("is-active")).toBe(false);
    expect(navigationItems[1].classList.contains("is-active")).toBe(true);
  });
});
