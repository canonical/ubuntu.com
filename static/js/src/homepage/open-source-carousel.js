import { prefersReducedMotion, onReducedMotionChange } from "./reduced-motion";
import { createTypewriter } from "./typewriter";

export const SLIDE_MS = 8000;

// Vanilla's large breakpoint: the command only types on desktop
const DESKTOP_QUERY = "(min-width: 1036px)";

const NAV_KEYS = {
  ArrowUp: -1,
  ArrowLeft: -1,
  ArrowDown: 1,
  ArrowRight: 1,
};

// The title becomes a button: the panel sits between titles, so this is an
// accordion, and a button gives Enter and Space for free.
function toButton(link, panel) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = link.className;
  button.textContent = link.textContent;
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", panel.id);
  link.replaceWith(button);
  return button;
}

// The slide swap animation (collapse, gap, expand) is all CSS: this only
// moves is-active, runs the progress bar and drives the typing.
export function startOpenSourceCarousel(root) {
  const slides = [...root.querySelectorAll(".p-open-source__slide")];
  const images = [...root.querySelectorAll(".p-open-source__image")];
  const pauseButtons = [...root.querySelectorAll(".js-open-source-pause")];
  const live = root.querySelector("[aria-live]");
  const list = root.querySelector(".p-open-source__slides");
  const phoneBar = root.querySelector(
    ".p-open-source__progress .p-open-source__bar",
  );
  const bars = slides.map((slide) =>
    slide.querySelector(".p-open-source__bar"),
  );
  const titles = slides.map((slide) =>
    toButton(
      slide.querySelector(".p-open-source__title"),
      slide.querySelector(".p-open-source__panel"),
    ),
  );
  // One typewriter per slide that has a command, null otherwise
  const writers = slides.map((slide) => {
    const code = slide.querySelector(".p-open-source__command code");
    return code && createTypewriter(code);
  });
  const desktop = window.matchMedia(DESKTOP_QUERY);

  let index = 0;
  // playing: autoplay and typing. chosen: a visitor picked a slide, so
  // autoplay stops but the command keeps typing. paused: Pause froze both.
  let mode = "playing";
  let onScreen = true;
  let elapsed = 0;
  let frame = null;
  let last = null;

  const wrap = (i) => (i + slides.length) % slides.length;
  const visible = () => onScreen && !document.hidden;

  function paint(transform) {
    bars[index].style.transform = transform;
    phoneBar.style.transform = transform;
  }

  function tick(now) {
    frame = null;
    elapsed += last === null ? 0 : now - last;
    last = now;
    if (elapsed >= SLIDE_MS) {
      go(wrap(index + 1));
    } else {
      paint(`scaleX(${elapsed / SLIDE_MS})`);
      frame = window.requestAnimationFrame(tick);
    }
  }

  // Bring the frame loop, the Pause buttons and the typing in line with state
  function sync() {
    const running = mode === "playing" && visible();
    if (running && frame === null) {
      frame = window.requestAnimationFrame(tick);
    } else if (!running && frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
      last = null;
    }

    const label = mode === "playing" ? "Pause carousel" : "Play carousel";
    const icon = mode === "playing" ? "p-icon--pause" : "p-icon--play";
    pauseButtons.forEach((button) => {
      button.setAttribute("aria-label", label);
      button.querySelector("i").className = icon;
    });

    const typing = desktop.matches && !prefersReducedMotion();
    writers.forEach((writer, i) => {
      if (!writer) {
        return;
      }
      if (i !== index || !typing) {
        writer.reset();
      } else if (mode !== "paused" && visible()) {
        writer.start();
      } else {
        writer.stop();
      }
    });
  }

  function go(target) {
    paint("");
    index = target;
    elapsed = 0;
    [slides, images].forEach((group) =>
      group.forEach((el, i) => el.classList.toggle("is-active", i === index)),
    );
    titles.forEach((title, i) =>
      title.setAttribute("aria-expanded", String(i === index)),
    );
    sync();
  }

  function setMode(next) {
    mode = next;
    sync();
  }

  // A visitor's choice stops autoplay (not a Pause), and is announced
  function choose(target) {
    if (mode === "playing") {
      mode = "chosen";
    }
    go(target);
    live.textContent = `Slide ${target + 1} of ${slides.length}: ${
      titles[target].textContent
    }`;
  }

  function onKeydown(event) {
    const current = titles.indexOf(event.target);
    if (current === -1) {
      return;
    }
    let target = null;
    if (event.key in NAV_KEYS) {
      target = wrap(current + NAV_KEYS[event.key]);
    } else if (event.key === "Home") {
      target = 0;
    } else if (event.key === "End") {
      target = titles.length - 1;
    }
    if (target !== null) {
      event.preventDefault();
      titles[target].focus();
    }
  }

  titles.forEach((title, i) =>
    title.addEventListener("click", () => choose(i)),
  );
  root
    .querySelectorAll(".js-open-source-step")
    .forEach((button) =>
      button.addEventListener("click", () =>
        choose(wrap(index + Number(button.dataset.step))),
      ),
    );
  pauseButtons.forEach((button) =>
    button.addEventListener("click", () =>
      setMode(mode === "playing" ? "paused" : "playing"),
    ),
  );
  list.addEventListener("keydown", onKeydown);
  document.addEventListener("visibilitychange", sync);
  if ("IntersectionObserver" in window) {
    new window.IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      sync();
    }).observe(root);
  }
  desktop.addEventListener("change", sync);
  onReducedMotionChange((reduced) => reduced && setMode("paused"));

  // The no-JS :target state is replaced by this one
  const hashed = slides.findIndex((slide) => `#${slide.id}` === location.hash);
  if (hashed !== -1) {
    window.history.replaceState(null, "", location.pathname + location.search);
  }
  mode = hashed === -1 && !prefersReducedMotion() ? "playing" : "chosen";
  go(Math.max(hashed, 0));
  root.classList.add("is-enhanced");
}
