import { startHero, WIDE_QUERY } from "./hero";

let media;

function mockMatchMedia({ wide = true, reduced = false } = {}) {
  media = {
    [WIDE_QUERY]: { matches: wide, listeners: [] },
    "(prefers-reduced-motion: reduce)": { matches: reduced, listeners: [] },
  };
  window.matchMedia = jest.fn((query) => ({
    get matches() {
      return media[query].matches;
    },
    addEventListener: (type, fn) => media[query].listeners.push(fn),
    removeEventListener: (type, fn) => {
      media[query].listeners = media[query].listeners.filter((f) => f !== fn);
    },
  }));
}

function setUpHero() {
  document.body.innerHTML = `
    <section class="p-hero">
      <video class="p-hero__video" data-src="/wallpaper.mp4"></video>
      <time class="js-desktop-clock"></time>
    </section>`;
  const root = document.querySelector(".p-hero");
  const video = root.querySelector("video");
  video.play = jest.fn(() => Promise.resolve());
  video.pause = jest.fn();
  video.load = jest.fn();
  return { root, video, clock: root.querySelector("time") };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it("plays the wallpaper and starts the clock on wide screens", () => {
  mockMatchMedia();
  const { root, video, clock } = setUpHero();
  startHero(root);
  expect(video.getAttribute("src")).toBe("/wallpaper.mp4");
  expect(video.play).toHaveBeenCalled();
  expect(clock.textContent).not.toBe("");
});

it("loads nothing on phones", () => {
  mockMatchMedia({ wide: false });
  const { root, video, clock } = setUpHero();
  startHero(root);
  expect(video.hasAttribute("src")).toBe(false);
  expect(clock.textContent).toBe("");
});

it("keeps the finished wallpaper with reduced motion", () => {
  mockMatchMedia({ reduced: true });
  const { root, video, clock } = setUpHero();
  startHero(root);
  expect(video.hasAttribute("src")).toBe(false);
  expect(clock.textContent).not.toBe("");
});

it("starts once when a phone turns into a wide screen", () => {
  mockMatchMedia({ wide: false });
  const { root, video } = setUpHero();
  startHero(root);
  media[WIDE_QUERY].listeners.forEach((fn) => fn({ matches: true }));
  expect(video.play).toHaveBeenCalledTimes(1);
  expect(media[WIDE_QUERY].listeners).toHaveLength(0);
});

it("stops the video if reduced motion turns on", () => {
  mockMatchMedia();
  const { root, video } = setUpHero();
  startHero(root);
  const reduce = media["(prefers-reduced-motion: reduce)"];
  reduce.listeners.forEach((fn) => fn({ matches: true }));
  expect(video.hasAttribute("src")).toBe(false);
  expect(root.classList.contains("is-playing")).toBe(false);
});
