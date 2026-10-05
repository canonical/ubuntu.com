import {
  prefersReducedMotion,
  onReducedMotionChange,
} from "./reduced-motion";

function mockMatchMedia(matches) {
  const mediaQueryList = {
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  window.matchMedia = jest.fn().mockReturnValue(mediaQueryList);
  return mediaQueryList;
}

afterEach(() => {
  delete window.matchMedia;
});

describe("prefersReducedMotion", () => {
  it("returns true when the media query matches", () => {
    mockMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it("returns false when the media query does not match", () => {
    mockMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("queries '(prefers-reduced-motion: reduce)'", () => {
    mockMatchMedia(false);
    prefersReducedMotion();
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)",
    );
  });

  it("returns false when window.matchMedia is undefined", () => {
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("onReducedMotionChange", () => {
  it("calls the callback with event.matches on change", () => {
    const mediaQueryList = mockMatchMedia(false);
    const callback = jest.fn();
    onReducedMotionChange(callback);

    const [eventName, handler] =
      mediaQueryList.addEventListener.mock.calls[0];
    expect(eventName).toBe("change");
    handler({ matches: true });

    expect(callback).toHaveBeenCalledWith(true);
  });

  it("removes the listener when unsubscribed", () => {
    const mediaQueryList = mockMatchMedia(false);
    const unsubscribe = onReducedMotionChange(jest.fn());
    const handler = mediaQueryList.addEventListener.mock.calls[0][1];

    unsubscribe();

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith(
      "change",
      handler,
    );
  });

  it("returns a no-op unsubscribe when window.matchMedia is undefined", () => {
    const unsubscribe = onReducedMotionChange(jest.fn());
    expect(() => unsubscribe()).not.toThrow();
  });
});
