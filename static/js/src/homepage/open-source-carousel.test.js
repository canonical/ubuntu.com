import {
  COLLAPSE_MS,
  GAP_MS,
  SLIDE_MS,
  startOpenSourceCarousel,
} from "./open-source-carousel";

let reduced;
let observe;
let desktop;

const COMMAND = "$ sudo snap install kube/juju";

function slide(id, title) {
  return `
    <div class="p-open-source__slide" id="open-source-${id}">
      <span class="p-open-source__bar"></span>
      <a class="p-open-source__title" href="#open-source-${id}">${title}</a>
      <div class="p-open-source__panel" id="open-source-${id}-panel">
        <div class="p-open-source__command"><code>${COMMAND}</code></div>
      </div>
    </div>`;
}

function setup({ hash = "" } = {}) {
  window.history.replaceState(null, "", `/${hash}`);
  const names = ["a", "b", "c"];
  document.body.innerHTML = `
    <section class="js-open-source-carousel">
      <button class="js-open-source-pause"><i class="p-icon--pause"></i></button>
      <button aria-label="Previous slide"></button>
      <button aria-label="Next slide"></button>
      ${names.map((name) => `<img class="p-open-source__image">`).join("")}
      <div class="p-open-source__progress">
        <span class="p-open-source__bar"></span>
      </div>
      <div class="p-open-source__slides">
        ${names.map((name) => slide(name, name.toUpperCase())).join("")}
      </div>
      <div aria-live="polite"></div>
    </section>`;
  const root = document.querySelector(".js-open-source-carousel");
  startOpenSourceCarousel(root);
  return root;
}

const active = (root) =>
  [...root.querySelectorAll(".p-open-source__slide")].findIndex((el) =>
    el.classList.contains("is-active"),
  );
const pauseLabel = (root) =>
  root.querySelector(".js-open-source-pause").getAttribute("aria-label");
const titles = (root) => root.querySelectorAll(".p-open-source__title");
const phoneBar = (root) =>
  root.querySelector(".p-open-source__progress .p-open-source__bar");
const click = (el) =>
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
const press = (el, key) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
const tick = (ms) => jest.advanceTimersByTime(ms);

beforeEach(() => {
  jest.useFakeTimers();
  reduced = false;
  desktop = false;
  observe = null;
  window.matchMedia = (query) => ({
    matches:
      (reduced && query.includes("reduced")) ||
      (desktop && query.includes("1036")),
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  window.IntersectionObserver = function (callback) {
    observe = (isIntersecting) => callback([{ isIntersecting }]);
    this.observe = () => {};
  };
});

afterEach(() => jest.useRealTimers());

describe("startOpenSourceCarousel", () => {
  it("advances after 8s and loops from the last slide", () => {
    const root = setup();

    tick(SLIDE_MS + COLLAPSE_MS + GAP_MS + 50);
    expect(active(root)).toBe(1);

    tick(2 * SLIDE_MS);
    expect(active(root)).toBe(0);
  });

  it("shows the chosen slide and pauses", () => {
    const root = setup();

    click(titles(root)[2]);
    tick(COLLAPSE_MS + GAP_MS);

    expect(active(root)).toBe(2);
    expect(pauseLabel(root)).toBe("Play carousel");
  });

  it("opens the new slide after collapse and gap, and the last go wins", () => {
    const root = setup();
    const [, b, c] = titles(root);

    click(b);
    tick(COLLAPSE_MS + GAP_MS - 1);
    expect(active(root)).toBe(-1);
    click(c);
    tick(COLLAPSE_MS + GAP_MS - 1);
    expect(active(root)).toBe(-1);
    tick(1);
    expect(active(root)).toBe(2);
  });

  it("freezes the bar on pause and resumes on play", () => {
    const root = setup();
    const pause = root.querySelector(".js-open-source-pause");
    tick(4000);

    click(pause);
    const frozen = phoneBar(root).style.transform;
    tick(4000);
    expect(phoneBar(root).style.transform).toBe(frozen);

    click(pause);
    tick(1000);
    expect(phoneBar(root).style.transform).not.toBe(frozen);
  });

  it("wraps with Previous and Next", () => {
    const root = setup();

    click(root.querySelector('[aria-label="Previous slide"]'));
    tick(COLLAPSE_MS + GAP_MS);
    expect(active(root)).toBe(2);

    click(root.querySelector('[aria-label="Next slide"]'));
    tick(COLLAPSE_MS + GAP_MS);
    expect(active(root)).toBe(0);
  });

  it("moves focus with arrows and End inside the title list", () => {
    const root = setup();
    const [first, , last] = titles(root);
    first.focus();

    press(first, "ArrowDown");
    expect(document.activeElement).toBe(titles(root)[1]);

    press(document.activeElement, "End");
    expect(document.activeElement).toBe(last);
  });

  it("ignores keys outside the title list", () => {
    const spy = jest.spyOn(document, "addEventListener");
    setup();
    press(document.body, "ArrowDown");

    expect(document.activeElement).toBe(document.body);
    expect(spy).not.toHaveBeenCalledWith("keydown", expect.anything());
  });

  it("holds off screen and resumes unless paused", () => {
    const root = setup();

    observe(false);
    tick(2 * SLIDE_MS);
    expect(active(root)).toBe(0);

    observe(true);
    tick(SLIDE_MS + COLLAPSE_MS + GAP_MS + 50);
    expect(active(root)).toBe(1);

    click(titles(root)[0]);
    observe(false);
    observe(true);
    tick(2 * SLIDE_MS);
    expect(pauseLabel(root)).toBe("Play carousel");
    expect(active(root)).toBe(0);
  });

  it("types the incoming command only once its slide shows", () => {
    desktop = true;
    const root = setup();
    const code = (i) =>
      root.querySelectorAll(".p-open-source__slide")[i].querySelector("code");

    tick(SLIDE_MS + 50);
    expect(code(0).textContent).not.toBe(COMMAND);
    expect(code(1).textContent).toBe(COMMAND);

    tick(COLLAPSE_MS + GAP_MS);
    expect(code(1).firstChild.textContent).toBe("$ sudo snap install ");
    tick(90);
    expect(code(1).firstChild.textContent).toBe("$ sudo snap install k");
  });

  it("starts paused with reduced motion", () => {
    reduced = true;
    const root = setup();

    tick(2 * SLIDE_MS);

    expect(pauseLabel(root)).toBe("Play carousel");
    expect(active(root)).toBe(0);
  });

  it("starts on a hashed slide, paused, and clears the hash", () => {
    const root = setup({ hash: "#open-source-c" });

    expect(active(root)).toBe(2);
    expect(pauseLabel(root)).toBe("Play carousel");
    expect(window.location.hash).toBe("");
  });
});
