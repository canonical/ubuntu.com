import { prefersReducedMotion, onReducedMotionChange } from "./reduced-motion";

// The fill tip sits 32% down the viewport (288px of 900px in the design)
export const TIP_RATIO = 0.32;
// Vanilla's small breakpoint; below it the rail is hidden
export const WIDE_QUERY = "(min-width: 620px)";

export function fillProgress(tip, top, height) {
  if (height <= 0) {
    return tip >= top ? 1 : 0;
  }
  return Math.min(Math.max((tip - top) / height, 0), 1);
}

export function startPerformanceRail(root) {
  const rings = [...root.querySelectorAll(".p-performance__ring")];
  const fills = [...root.querySelectorAll(".p-performance__fill")];
  const wideQuery = window.matchMedia(WIDE_QUERY);
  let stopCurrent = null;

  // Read every rect before writing, so the frame forces at most one style recalc
  function update() {
    const tip = window.innerHeight * TIP_RATIO;
    const progress = fills.map((fill) => {
      const { top, height } = fill.parentElement.getBoundingClientRect();
      return fillProgress(tip, top, height);
    });
    const lit = rings.map((ring) => {
      const { top, height } = ring.getBoundingClientRect();
      return top + height / 2 < tip;
    });
    fills.forEach((fill, index) => {
      fill.style.transform = `scaleY(${progress[index]})`;
    });
    rings.forEach((ring, index) => {
      ring.classList.toggle("is-active", lit[index]);
    });
  }

  // Back to the no-JS state: fully filled, every ring lit
  function reset() {
    fills.forEach((fill) => {
      fill.style.transform = "";
    });
    rings.forEach((ring) => ring.classList.add("is-active"));
  }

  function start() {
    let frame = null;
    let listening = false;

    const onScroll = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(() => {
          frame = null;
          update();
        });
      }
    };

    const listen = () => {
      if (!listening) {
        listening = true;
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
      }
      update();
    };

    const unlisten = () => {
      if (listening) {
        listening = false;
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    };

    let observer = null;
    if ("IntersectionObserver" in window) {
      observer = new window.IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          listen();
        } else {
          unlisten();
        }
      });
      observer.observe(root);
    } else {
      listen();
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      unlisten();
      reset();
    };
  }

  function sync() {
    const shouldRun = wideQuery.matches && !prefersReducedMotion();
    if (shouldRun && !stopCurrent) {
      stopCurrent = start();
    } else if (!shouldRun && stopCurrent) {
      stopCurrent();
      stopCurrent = null;
    }
  }

  wideQuery.addEventListener("change", sync);
  onReducedMotionChange(sync);
  sync();
}
