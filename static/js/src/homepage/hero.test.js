import { startHero, WIDE_QUERY } from "./hero";

function setUpHero({ wide = true, reduced = false } = {}) {
  const wideQuery = { matches: wide, addEventListener: jest.fn() };
  window.matchMedia = (query) =>
    query === WIDE_QUERY ? wideQuery : { matches: reduced };
  document.body.innerHTML = `
    <section class="p-hero">
      <video class="p-hero__video" data-src="/wallpaper.mp4"></video>
      <span class="js-desktop-clock"></span>
    </section>`;
  const root = document.querySelector(".p-hero");
  const video = root.querySelector("video");
  video.play = jest.fn(() => Promise.resolve());
  startHero(root);
  return { root, video, wideQuery };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it("plays the wallpaper on wide screens, swapping it in once playing", () => {
  const { root, video } = setUpHero();
  expect(video.play).toHaveBeenCalled();
  expect(root.classList.contains("is-playing")).toBe(false);
  video.dispatchEvent(new Event("playing"));
  expect(root.classList.contains("is-playing")).toBe(true);
});

it("waits for a wide screen before loading the video", () => {
  const { video, wideQuery } = setUpHero({ wide: false });
  expect(video.hasAttribute("src")).toBe(false);
  wideQuery.addEventListener.mock.calls[0][1]();
  expect(video.getAttribute("src")).toBe("/wallpaper.mp4");
});

it("keeps the finished wallpaper with reduced motion", () => {
  const { video } = setUpHero({ reduced: true });
  expect(video.hasAttribute("src")).toBe(false);
});

it("waits for the page to load before fetching the video", () => {
  const readyState = jest
    .spyOn(document, "readyState", "get")
    .mockReturnValue("interactive");
  const { video } = setUpHero();
  expect(video.hasAttribute("src")).toBe(false);
  window.dispatchEvent(new Event("load"));
  expect(video.getAttribute("src")).toBe("/wallpaper.mp4");
  readyState.mockRestore();
});

it("waits for the page to load when widened mid-load", () => {
  const readyState = jest
    .spyOn(document, "readyState", "get")
    .mockReturnValue("interactive");
  const { video, wideQuery } = setUpHero({ wide: false });
  wideQuery.addEventListener.mock.calls[0][1]();
  expect(video.hasAttribute("src")).toBe(false);
  window.dispatchEvent(new Event("load"));
  expect(video.getAttribute("src")).toBe("/wallpaper.mp4");
  readyState.mockRestore();
});
