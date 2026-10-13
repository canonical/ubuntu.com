import { SLIDE_MS, startOpenSourceCarousel } from "./open-source-carousel";

const COMMAND = "$ sudo snap install kube/juju";
const LEAD_IN_MS = 1500;

let root;
let reduced;
let desktop;
let observe;

function setup(hash = "") {
  window.history.replaceState(null, "", `/${hash}`);
  const slides = ["a", "b", "c"].map(
    (id) => `
      <div class="p-open-source__slide" id="open-source-${id}">
        <span class="p-open-source__bar"></span>
        <a class="p-open-source__title" href="#open-source-${id}">${id}</a>
        <div class="p-open-source__panel" id="open-source-${id}-panel">
          <div class="p-open-source__command"><code>${COMMAND}</code></div>
        </div>
      </div>`,
  );
  document.body.innerHTML = `
    <section class="js-open-source-carousel">
      <button class="js-open-source-pause"><i></i></button>
      <button class="js-open-source-step" data-step="-1"></button>
      <button class="js-open-source-step" data-step="1"></button>
      ${'<img class="p-open-source__image">'.repeat(slides.length)}
      <div class="p-open-source__progress">
        <span class="p-open-source__bar"></span>
      </div>
      <div class="p-open-source__slides">${slides.join("")}</div>
      <div aria-live="polite"></div>
    </section>`;
  root = document.querySelector("section");
  startOpenSourceCarousel(root);
}

const active = () =>
  [...root.querySelectorAll(".p-open-source__slide")].findIndex((slide) =>
    slide.classList.contains("is-active"),
  );
const pause = () => root.querySelector(".js-open-source-pause");
const titles = () => root.querySelectorAll(".p-open-source__title");
const command = (i) => root.querySelectorAll("code")[i];
// The visible, typed part of a command
const typed = (i) => command(i).firstChild.textContent;
const press = (key) =>
  document.activeElement.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true }),
  );
const tick = (ms) => jest.advanceTimersByTime(ms);

beforeEach(() => {
  jest.useFakeTimers();
  reduced = false;
  desktop = false;
  window.matchMedia = (query) => ({
    matches: query.includes("reduced") ? reduced : desktop,
    addEventListener: () => {},
  });
  window.IntersectionObserver = function (callback) {
    observe = (isIntersecting) => callback([{ isIntersecting }]);
    this.observe = () => {};
  };
});

afterEach(() => jest.useRealTimers());

describe("startOpenSourceCarousel", () => {
  it("advances after 8s, not typing on phones, and loops", () => {
    setup();

    tick(SLIDE_MS + 50);
    expect(active()).toBe(1);
    expect(command(1).textContent).toBe(COMMAND);

    tick(2 * SLIDE_MS);
    expect(active()).toBe(0);
  });

  it("expands, announces and types a chosen slide, until Play", () => {
    desktop = true;
    setup();
    const title = titles()[2];

    title.click();
    tick(LEAD_IN_MS + 100);
    expect(typed(2)).toBe("$ sudo snap install ku");
    expect(title.getAttribute("aria-expanded")).toBe("true");
    expect(title.getAttribute("aria-controls")).toBe("open-source-c-panel");
    expect(root.querySelector("[aria-live]").textContent).toContain("3 of 3");
    expect(pause().getAttribute("aria-label")).toBe("Play carousel");

    tick(2 * SLIDE_MS);
    expect(active()).toBe(2);

    pause().click();
    tick(SLIDE_MS + 50);
    expect(active()).toBe(0);
  });

  it("freezes the bar but keeps typing on Pause, resumes on Play", () => {
    desktop = true;
    setup();
    const bar = root.querySelector(".p-open-source__progress span");
    tick(LEAD_IN_MS + 100);

    pause().click();
    const frozen = bar.style.transform;
    const typedAtPause = typed(0);
    tick(1000);
    expect(bar.style.transform).toBe(frozen);
    expect(typed(0)).not.toBe(typedAtPause);

    pause().click();
    tick(100);
    expect(bar.style.transform).not.toBe(frozen);
  });

  it("wraps with Previous and Next", () => {
    setup();
    const [previous, next] = root.querySelectorAll(".js-open-source-step");

    previous.click();
    expect(active()).toBe(2);

    next.click();
    expect(active()).toBe(0);
  });

  it("moves focus with arrows, Home and End in the title list only", () => {
    setup();
    const [first, second, last] = titles();
    first.focus();

    press("ArrowDown");
    expect(document.activeElement).toBe(second);

    press("End");
    expect(document.activeElement).toBe(last);

    press("Home");
    expect(document.activeElement).toBe(first);

    pause().focus();
    press("End");
    expect(document.activeElement).toBe(pause());
  });

  it("holds off screen and resumes unless stopped", () => {
    setup();

    observe(false);
    tick(2 * SLIDE_MS);
    expect(active()).toBe(0);

    observe(true);
    tick(SLIDE_MS + 50);
    expect(active()).toBe(1);

    titles()[0].click();
    observe(false);
    observe(true);
    tick(2 * SLIDE_MS);
    expect(active()).toBe(0);
  });

  it("types the incoming command after the lead-in, on desktop", () => {
    desktop = true;
    setup();

    tick(SLIDE_MS + 50);
    expect(command(0).textContent).toBe(COMMAND);
    expect(typed(1)).toBe("$ sudo snap install ");

    tick(LEAD_IN_MS);
    expect(typed(1)).toBe("$ sudo snap install k");
  });

  it("starts paused with reduced motion", () => {
    reduced = true;
    setup();

    tick(2 * SLIDE_MS);

    expect(active()).toBe(0);
    expect(pause().getAttribute("aria-label")).toBe("Play carousel");
  });

  it("starts on a hashed slide, paused, and clears the hash", () => {
    setup("#open-source-c");

    tick(2 * SLIDE_MS);

    expect(active()).toBe(2);
    expect(window.location.hash).toBe("");
  });
});
