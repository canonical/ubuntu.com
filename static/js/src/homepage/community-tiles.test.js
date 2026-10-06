import { startCommunityTiles } from "./community-tiles";

let observerCallback;
let reducedMotion;
let motionListener;

beforeEach(() => {
  observerCallback = null;
  reducedMotion = false;
  motionListener = null;

  window.IntersectionObserver = jest.fn((callback) => {
    observerCallback = callback;
    return { observe: jest.fn(), disconnect: jest.fn() };
  });
  window.matchMedia = jest.fn(() => ({
    matches: reducedMotion,
    addEventListener: (event, listener) => {
      motionListener = listener;
    },
    removeEventListener: jest.fn(),
  }));
  jest
    .spyOn(window.HTMLMediaElement.prototype, "play")
    .mockImplementation(() => Promise.resolve());
  jest
    .spyOn(window.HTMLMediaElement.prototype, "pause")
    .mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete window.IntersectionObserver;
  delete window.matchMedia;
  document.body.innerHTML = "";
});

function renderTiles({ withVideo = true } = {}) {
  const media = withVideo
    ? `<video class="p-community-tile__media" muted loop playsinline></video>`
    : `<img class="p-community-tile__media" src="photo.jpg" alt="" />`;
  document.body.innerHTML = `
    <section class="js-community-tiles">
      <article class="p-community-tile">${media}<a href="#">Go</a></article>
    </section>
  `;
  const root = document.querySelector(".js-community-tiles");
  startCommunityTiles(root);
  return {
    tile: root.querySelector(".p-community-tile"),
    video: root.querySelector("video"),
  };
}

function setVisible(tile, isIntersecting) {
  observerCallback([{ target: tile, isIntersecting }]);
}

describe("startCommunityTiles", () => {
  it("plays a video when its tile enters the viewport", () => {
    const { tile, video } = renderTiles();

    setVisible(tile, true);

    expect(video.play).toHaveBeenCalledTimes(1);
  });

  it("pauses a video when its tile leaves the viewport", () => {
    const { tile, video } = renderTiles();
    setVisible(tile, true);

    setVisible(tile, false);

    expect(video.pause).toHaveBeenCalledTimes(1);
  });

  it("pauses on pointer or focus entering the tile and resumes on leaving", () => {
    const { tile, video } = renderTiles();
    setVisible(tile, true);

    tile.dispatchEvent(new MouseEvent("mouseenter"));
    tile.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(video.pause).toHaveBeenCalledTimes(2);

    tile.dispatchEvent(new MouseEvent("mouseleave"));
    expect(video.play).toHaveBeenCalledTimes(2);
  });

  it("does not resume on leave while the tile is off screen", () => {
    const { tile, video } = renderTiles();

    tile.dispatchEvent(new MouseEvent("mouseleave"));

    expect(video.play).not.toHaveBeenCalled();
  });

  it("swallows a rejected play() promise", async () => {
    window.HTMLMediaElement.prototype.play.mockImplementation(() =>
      Promise.reject(new Error("NotAllowedError")),
    );
    const { tile } = renderTiles();

    expect(() => setVisible(tile, true)).not.toThrow();
    await Promise.resolve();
  });

  it("never plays with reduced motion", () => {
    reducedMotion = true;
    const { tile, video } = renderTiles();

    setVisible(tile, true);
    tile.dispatchEvent(new MouseEvent("mouseleave"));

    expect(video.play).not.toHaveBeenCalled();
  });

  it("pauses playing videos when reduced motion turns on", () => {
    const { tile, video } = renderTiles();
    setVisible(tile, true);

    reducedMotion = true;
    motionListener({ matches: true });

    expect(video.pause).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the section has no videos", () => {
    renderTiles({ withVideo: false });

    expect(window.IntersectionObserver).not.toHaveBeenCalled();
  });
});
