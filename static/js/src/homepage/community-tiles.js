import { prefersReducedMotion, onReducedMotionChange } from "./reduced-motion";

// Plays each tile's background video only while the tile is on screen, and
// pauses it while the pointer or focus is on the tile so its text is readable.
// With reduced motion, videos never play and only the poster shows.
export function startCommunityTiles(root) {
  const tiles = [...root.querySelectorAll(".p-community-tile")]
    .map((tile) => ({ tile, video: tile.querySelector("video") }))
    .filter(({ video }) => video);

  if (!tiles.length || typeof window.IntersectionObserver !== "function") {
    return;
  }

  const state = new Map(
    tiles.map(({ tile }) => [tile, { isVisible: false, isActive: false }]),
  );

  const update = ({ tile, video }) => {
    const { isVisible, isActive } = state.get(tile);
    if (isVisible && !isActive && !prefersReducedMotion()) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      state.get(target).isVisible = isIntersecting;
      update(tiles.find(({ tile }) => tile === target));
    });
  });

  tiles.forEach((entry) => {
    const { tile } = entry;
    const setActive = (isActive) => () => {
      state.get(tile).isActive = isActive;
      update(entry);
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

  onReducedMotionChange(() => tiles.forEach(update));
}
