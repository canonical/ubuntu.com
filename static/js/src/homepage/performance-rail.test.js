import {
  fillProgress,
  startPerformanceRail,
  TIP_RATIO,
  WIDE_QUERY,
} from "./performance-rail";

const VIEWPORT_HEIGHT = 1000;
const TIP = VIEWPORT_HEIGHT * TIP_RATIO; // 320

let mediaQueries;
let observers;

function mockMatchMedia({ wide = true, reduced = false } = {}) {
  mediaQueries = {
    [WIDE_QUERY]: { matches: wide, listeners: [] },
    "(prefers-reduced-motion: reduce)": { matches: reduced, listeners: [] },
  };
  window.matchMedia = jest.fn((query) => {
    const state = mediaQueries[query];
    return {
      get matches() {
        return state.matches;
      },
      addEventListener: (type, listener) => state.listeners.push(listener),
      removeEventListener: (type, listener) => {
        state.listeners = state.listeners.filter((item) => item !== listener);
      },
    };
  });
}

function changeMedia(query, matches) {
  const state = mediaQueries[query];
  state.matches = matches;
  state.listeners.forEach((listener) => listener({ matches }));
}

function mockIntersectionObserver() {
  observers = [];
  window.IntersectionObserver = jest.fn((callback) => {
    const observer = {
      callback,
      observe: jest.fn(),
      disconnect: jest.fn(),
    };
    observers.push(observer);
    return observer;
  });
}

function setIntersecting(isIntersecting) {
  observers.forEach((observer) => observer.callback([{ isIntersecting }]));
}

function setRect(element, top, height) {
  element.getBoundingClientRect = () => ({
    top,
    height,
    bottom: top + height,
  });
}

// Two rows: ring 1 (80px) then track 1 (200px), then ring 2.
// `offset` moves everything as if the page had scrolled.
function renderRail() {
  document.body.innerHTML = `
    <section class="js-performance-rail">
      <div class="p-performance__rail">
        <span class="p-performance__ring is-active"></span>
        <span class="p-performance__track"><span class="p-performance__fill"></span></span>
      </div>
      <div class="p-performance__rail">
        <span class="p-performance__ring is-active"></span>
      </div>
    </section>
  `;
  const root = document.querySelector(".js-performance-rail");
  const rings = [...root.querySelectorAll(".p-performance__ring")];
  const tracks = [...root.querySelectorAll(".p-performance__track")];
  const fills = [...root.querySelectorAll(".p-performance__fill")];
  const layout = (offset) => {
    setRect(rings[0], 400 - offset, 80);
    setRect(tracks[0], 480 - offset, 200);
    setRect(rings[1], 680 - offset, 80);
  };
  layout(0);
  return { root, rings, fills, layout };
}

// Like the browser, run queued animation frames after the event
function flushFrames() {
  const queued = frames;
  frames = [];
  queued.forEach((callback) => callback && callback());
}

function scroll() {
  window.dispatchEvent(new Event("scroll"));
  flushFrames();
}

let frames;
let addSpy;
let removeSpy;

beforeEach(() => {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: VIEWPORT_HEIGHT,
  });
  frames = [];
  window.requestAnimationFrame = jest.fn((callback) => frames.push(callback));
  window.cancelAnimationFrame = jest.fn((id) => {
    frames[id - 1] = null;
  });
  mockMatchMedia();
  mockIntersectionObserver();
  addSpy = jest.spyOn(window, "addEventListener");
  removeSpy = jest.spyOn(window, "removeEventListener");
});

afterEach(() => {
  jest.restoreAllMocks();
  delete window.matchMedia;
  delete window.IntersectionObserver;
});

function scrollListenerAttached() {
  const added = addSpy.mock.calls.filter(([type]) => type === "scroll");
  const removed = removeSpy.mock.calls.filter(([type]) => type === "scroll");
  return added.length > removed.length;
}

describe("fillProgress", () => {
  it("is 0 while the tip is above the track", () => {
    expect(fillProgress(100, 200, 100)).toBe(0);
  });

  it("is the share of the track above the tip", () => {
    expect(fillProgress(250, 200, 100)).toBe(0.5);
  });

  it("is 1 once the tip passes the track", () => {
    expect(fillProgress(400, 200, 100)).toBe(1);
  });

  it("handles a zero-height track without NaN", () => {
    expect(fillProgress(199, 200, 0)).toBe(0);
    expect(fillProgress(200, 200, 0)).toBe(1);
  });
});

describe("startPerformanceRail", () => {
  it("drives fills and rings from scroll once on screen", () => {
    const { root, rings, fills, layout } = renderRail();
    startPerformanceRail(root);
    setIntersecting(true);

    // Ring 1 centre (440) is below the tip (320): nothing filled or lit.
    expect(fills[0].style.transform).toBe("scaleY(0)");
    expect(rings[0].classList.contains("is-active")).toBe(false);
    expect(rings[1].classList.contains("is-active")).toBe(false);

    // Scroll 260px: ring 1 centre at 180, track spans 220-420.
    layout(260);
    scroll();
    expect(fills[0].style.transform).toBe("scaleY(0.5)");
    expect(rings[0].classList.contains("is-active")).toBe(true);
    expect(rings[1].classList.contains("is-active")).toBe(false);

    // Scroll 500px: ring 2 centre at 220.
    layout(500);
    scroll();
    expect(fills[0].style.transform).toBe("scaleY(1)");
    expect(rings[1].classList.contains("is-active")).toBe(true);
  });

  it("reverses when scrolling back up", () => {
    const { root, rings, fills, layout } = renderRail();
    startPerformanceRail(root);
    setIntersecting(true);
    layout(500);
    scroll();

    layout(260);
    scroll();

    expect(fills[0].style.transform).toBe("scaleY(0.5)");
    expect(rings[1].classList.contains("is-active")).toBe(false);
  });

  it("recomputes on resize", () => {
    const { root, fills, layout } = renderRail();
    startPerformanceRail(root);
    setIntersecting(true);

    layout(260);
    window.dispatchEvent(new Event("resize"));
    flushFrames();

    expect(fills[0].style.transform).toBe("scaleY(0.5)");
  });

  it("only listens to scroll while the section is on screen", () => {
    const { root } = renderRail();
    startPerformanceRail(root);
    expect(scrollListenerAttached()).toBe(false);

    setIntersecting(true);
    expect(scrollListenerAttached()).toBe(true);

    setIntersecting(false);
    expect(scrollListenerAttached()).toBe(false);
  });

  it("does nothing on phones", () => {
    mockMatchMedia({ wide: false });
    const { root, rings, fills } = renderRail();
    startPerformanceRail(root);

    expect(window.IntersectionObserver).not.toHaveBeenCalled();
    expect(scrollListenerAttached()).toBe(false);
    expect(fills[0].style.transform).toBe("");
    rings.forEach((ring) =>
      expect(ring.classList.contains("is-active")).toBe(true),
    );
  });

  it("stays filled and still with reduced motion", () => {
    mockMatchMedia({ reduced: true });
    const { root, rings, fills } = renderRail();
    startPerformanceRail(root);

    expect(window.IntersectionObserver).not.toHaveBeenCalled();
    expect(scrollListenerAttached()).toBe(false);
    expect(fills[0].style.transform).toBe("");
    rings.forEach((ring) =>
      expect(ring.classList.contains("is-active")).toBe(true),
    );
  });

  it("resets to filled when reduced motion turns on, and resumes after", () => {
    const { root, rings, fills } = renderRail();
    startPerformanceRail(root);
    setIntersecting(true);
    expect(fills[0].style.transform).toBe("scaleY(0)");

    changeMedia("(prefers-reduced-motion: reduce)", true);
    expect(scrollListenerAttached()).toBe(false);
    expect(observers[0].disconnect).toHaveBeenCalled();
    expect(fills[0].style.transform).toBe("");
    rings.forEach((ring) =>
      expect(ring.classList.contains("is-active")).toBe(true),
    );

    changeMedia("(prefers-reduced-motion: reduce)", false);
    setIntersecting(true);
    expect(scrollListenerAttached()).toBe(true);
    expect(fills[0].style.transform).toBe("scaleY(0)");
  });

  it("resets to filled when the screen narrows to phone width", () => {
    const { root, rings, fills } = renderRail();
    startPerformanceRail(root);
    setIntersecting(true);

    changeMedia(WIDE_QUERY, false);

    expect(scrollListenerAttached()).toBe(false);
    expect(fills[0].style.transform).toBe("");
    rings.forEach((ring) =>
      expect(ring.classList.contains("is-active")).toBe(true),
    );
  });

  it("reads every rect before writing any style in a frame", () => {
    const { root, rings, fills } = renderRail();
    const log = [];
    [...rings, fills[0].parentElement].forEach((element) => {
      const read = element.getBoundingClientRect;
      element.getBoundingClientRect = () => {
        log.push("read");
        return read();
      };
    });
    const toggle = DOMTokenList.prototype.toggle;
    jest.spyOn(DOMTokenList.prototype, "toggle").mockImplementation(function (
      ...args
    ) {
      log.push("write");
      return toggle.apply(this, args);
    });
    Object.defineProperty(fills[0].style, "transform", {
      set: () => {
        log.push("write");
      },
    });
    startPerformanceRail(root);
    setIntersecting(true);

    expect(log.lastIndexOf("read")).toBeLessThan(log.indexOf("write"));
  });

  it("listens straight away without IntersectionObserver", () => {
    delete window.IntersectionObserver;
    const { root, fills, layout } = renderRail();
    startPerformanceRail(root);
    expect(scrollListenerAttached()).toBe(true);

    layout(260);
    scroll();
    expect(fills[0].style.transform).toBe("scaleY(0.5)");
  });
});
