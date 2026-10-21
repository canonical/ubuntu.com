import { startDesktopClock } from "./desktop-clock";
import { prefersReducedMotion } from "./reduced-motion";

// Vanilla's small breakpoint; below it the mock desktop is hidden
export const WIDE_QUERY = "(min-width: 620px)";

export function startHero(root) {
  const video = root.querySelector(".p-hero__video");
  const wideQuery = window.matchMedia(WIDE_QUERY);
  startDesktopClock(root.querySelector(".js-desktop-clock"));

  // Keep the finished still until the first frame is on screen. If the
  // browser refuses autoplay, e.g. in battery saver mode, the still stays.
  function playVideo() {
    video.addEventListener("playing", () => root.classList.add("is-playing"));
    video.src = video.dataset.src;
    video.play().catch(() => {});
  }

  if (prefersReducedMotion()) {
    return;
  }
  if (wideQuery.matches) {
    // The video is the biggest download; keep it out of the page load
    if (document.readyState === "complete") {
      playVideo();
    } else {
      window.addEventListener("load", playVideo, { once: true });
    }
  } else {
    wideQuery.addEventListener("change", playVideo, { once: true });
  }
}
