import { prefersReducedMotion, onReducedMotionChange } from "./reduced-motion";

// Plays each tile's background video only while the tile is on screen, and
// pauses it while the pointer or focus is on the tile so its text is readable.
// Pause holds every video until pressed again. With reduced motion, videos
// never play and only the poster shows.
export function startCommunityTiles(root) {
  if (typeof window.IntersectionObserver !== "function") {
    return;
  }

  // Each video waits in a template beside its image, so no-JS visitors never
  // get the browser's forced video controls. Swapped in, the image becomes
  // its poster.
  const tiles = new Map();
  root.querySelectorAll(".p-community-tile").forEach((tile) => {
    const template = tile.querySelector(".js-community-video");
    if (template) {
      const frame = template.parentElement;
      const image = frame.querySelector("img");
      const video = template.content.querySelector("video");
      video.poster = image.currentSrc || image.src;
      frame.replaceChildren(video);
      tiles.set(tile, {
        video,
        isVisible: false,
        isHovered: false,
        isFocused: false,
      });
    }
  });

  if (!tiles.size) {
    return;
  }

  const pauseButton = root.querySelector(".js-community-pause");
  let isPaused = false;

  const update = (tile) => {
    const { video, isVisible, isHovered, isFocused } = tiles.get(tile);
    const isHeld = isHovered || isFocused || isPaused;
    if (isVisible && !isHeld && !prefersReducedMotion()) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  // Bring the Pause button and every video in line with state. With reduced
  // motion nothing plays, so there is nothing to pause.
  const sync = () => {
    const icon = isPaused ? "play" : "pause";
    pauseButton.classList.toggle("u-hide", prefersReducedMotion());
    pauseButton.setAttribute(
      "aria-label",
      isPaused ? "Play videos" : "Pause videos",
    );
    pauseButton
      .querySelectorAll("[data-icon]")
      .forEach((img) => (img.hidden = img.dataset.icon !== icon));
    tiles.forEach((state, tile) => update(tile));
  };

  pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    sync();
  });

  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      tiles.get(target).isVisible = isIntersecting;
      update(target);
    });
  });

  tiles.forEach((state, tile) => {
    // Hover and focus are tracked apart, so ending one keeps the other's pause
    const set = (key, value) => {
      state[key] = value;
      update(tile);
    };
    tile.addEventListener("mouseenter", () => set("isHovered", true));
    tile.addEventListener("mouseleave", () => set("isHovered", false));
    tile.addEventListener("focusin", () => set("isFocused", true));
    tile.addEventListener("focusout", (event) => {
      if (!tile.contains(event.relatedTarget)) {
        set("isFocused", false);
      }
    });
    observer.observe(tile);
  });

  onReducedMotionChange(sync);
  sync();
}
