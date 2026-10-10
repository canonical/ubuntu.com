import { startCommunityTiles } from "./community-tiles";

let observerCallback;
let reducedMotion;
let motionListener;

beforeEach(() => {
  reducedMotion = false;
  window.IntersectionObserver = jest.fn((callback) => {
    observerCallback = callback;
    return { observe: jest.fn() };
  });
  window.matchMedia = jest.fn(() => ({
    matches: reducedMotion,
    addEventListener: (event, listener) => {
      motionListener = listener;
    },
  }));
  jest
    .spyOn(window.HTMLMediaElement.prototype, "play")
    .mockResolvedValue(undefined);
  jest.spyOn(window.HTMLMediaElement.prototype, "pause").mockReturnValue();
});

afterEach(() => {
  jest.restoreAllMocks();
  delete window.IntersectionObserver;
  delete window.matchMedia;
});

function renderTile() {
  document.body.innerHTML = `
    <section><article class="p-community-tile"><video></video></article></section>
  `;
  startCommunityTiles(document.querySelector("section"));
  return {
    tile: document.querySelector(".p-community-tile"),
    video: document.querySelector("video"),
  };
}

const setVisible = (tile, isIntersecting) =>
  observerCallback([{ target: tile, isIntersecting }]);

describe("startCommunityTiles", () => {
  it("plays only while the tile is on screen", () => {
    const { tile, video } = renderTile();

    setVisible(tile, true);
    expect(video.play).toHaveBeenCalledTimes(1);

    setVisible(tile, false);
    expect(video.pause).toHaveBeenCalledTimes(1);
  });

  it("pauses on hover or focus and resumes on leave", () => {
    const { tile, video } = renderTile();
    setVisible(tile, true);

    tile.dispatchEvent(new MouseEvent("mouseenter"));
    tile.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(video.pause).toHaveBeenCalledTimes(2);

    tile.dispatchEvent(new MouseEvent("mouseleave"));
    expect(video.play).toHaveBeenCalledTimes(2);
  });

  it("never plays with reduced motion, and pauses when it turns on", () => {
    const { tile, video } = renderTile();
    setVisible(tile, true);

    reducedMotion = true;
    motionListener({ matches: true });
    expect(video.pause).toHaveBeenCalledTimes(1);

    setVisible(tile, true);
    expect(video.play).toHaveBeenCalledTimes(1);
  });
});
