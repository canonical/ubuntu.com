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
    <section>
      <button class="js-community-pause" hidden>
        <img data-icon="pause" /><img data-icon="play" hidden />
      </button>
      <article class="p-community-tile">
        <img /><template class="js-community-video"><video></video></template>
      </article>
    </section>
  `;
  startCommunityTiles(document.querySelector("section"));
  return {
    tile: document.querySelector(".p-community-tile"),
    video: document.querySelector("video"),
    button: document.querySelector("button"),
  };
}

const setVisible = (tile, isIntersecting) =>
  observerCallback([{ target: tile, isIntersecting }]);

describe("startCommunityTiles", () => {
  it("swaps the poster image for the video", () => {
    renderTile();
    expect(document.querySelector("article img")).toBeNull();
    expect(document.querySelector("template")).toBeNull();
  });

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

  it("holds every video while Pause is pressed", () => {
    const { tile, video, button } = renderTile();
    setVisible(tile, true);
    expect(button.hidden).toBe(false);

    button.click();
    setVisible(tile, true);
    expect(video.play).toHaveBeenCalledTimes(1);
    expect(button.getAttribute("aria-label")).toBe("Play videos");

    button.click();
    expect(video.play).toHaveBeenCalledTimes(2);
  });
});
