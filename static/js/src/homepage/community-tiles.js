import { prefersReducedMotion, onReducedMotionChange } from "./reduced-motion";

// Plays each tile's background video only while the tile is on screen, and
// pauses it while the pointer or focus is on the tile so its text is readable.
// With reduced motion, videos never play and only the poster shows.
export function startCommunityTiles(root) {
  const tiles = new Map();
  root.querySelectorAll(".p-community-tile").forEach((tile) => {
    const video = tile.querySelector("video");
    if (video) {
      tiles.set(tile, { video, isVisible: false, isActive: false });
    }
  });

  if (!tiles.size || typeof window.IntersectionObserver !== "function") {
    return;
  }

  const update = (tile) => {
    const { video, isVisible, isActive } = tiles.get(tile);
    if (isVisible && !isActive && !prefersReducedMotion()) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      tiles.get(target).isVisible = isIntersecting;
      update(target);
    });
  });

  tiles.forEach((state, tile) => {
    const setActive = (isActive) => () => {
      state.isActive = isActive;
      update(tile);
    };
    tile.addEventListener("mouseenter", setActive(true));
    tile.addEventListener("mouseleave", setActive(false));
    tile.addEventListener("focusin", setActive(true));
    tile.addEventListener("focusout", (event) => {
      if (!tile.contains(event.relatedTarget)) {
        setActive(false)();
      }
    });
    observer.observe(tile);
  });

  onReducedMotionChange(() => tiles.forEach((state, tile) => update(tile)));
}
