const QUERY = "(prefers-reduced-motion: reduce)";

function getMediaQueryList() {
  if (typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(QUERY);
}

export function prefersReducedMotion() {
  const mediaQueryList = getMediaQueryList();
  return mediaQueryList ? mediaQueryList.matches : false;
}

export function onReducedMotionChange(callback) {
  const mediaQueryList = getMediaQueryList();
  if (!mediaQueryList) {
    return () => {};
  }

  const handleChange = (event) => callback(event.matches);
  mediaQueryList.addEventListener("change", handleChange);
  return () => mediaQueryList.removeEventListener("change", handleChange);
}
