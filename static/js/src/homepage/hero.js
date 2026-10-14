import { startDesktopClock } from "./desktop-clock";
import { prefersReducedMotion, onReducedMotionChange } from "./reduced-motion";

// Vanilla's small breakpoint; below it the mock desktop is hidden
export const WIDE_QUERY = "(min-width: 620px)";

export function startHero(root) {
  const video = root.querySelector(".p-hero__video");
  const clock = root.querySelector(".js-desktop-clock");
  const wideQuery = window.matchMedia(WIDE_QUERY);

  // Back to the finished wallpaper behind the video
  function stopVideo() {
    video.pause();
    video.removeAttribute("src");
    video.load();
    root.classList.remove("is-playing");
  }

  function playVideo() {
    root.classList.add("is-playing");
    video.src = video.dataset.src;
    // Browsers can refuse autoplay, e.g. in battery saver mode
    Promise.resolve(video.play()).catch(stopVideo);
    onReducedMotionChange((reduced) => {
      if (reduced) {
        stopVideo();
      }
    });
  }

  // Only load and run the desktop once it's on screen
  function activate() {
    wideQuery.removeEventListener("change", onWideChange);
    startDesktopClock(clock);
    if (!prefersReducedMotion()) {
      playVideo();
    }
  }

  function onWideChange(event) {
    if (event.matches) {
      activate();
    }
  }

  if (wideQuery.matches) {
    activate();
  } else {
    wideQuery.addEventListener("change", onWideChange);
  }
}
