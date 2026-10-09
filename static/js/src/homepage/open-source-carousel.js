import { prefersReducedMotion, onReducedMotionChange } from "./reduced-motion";

export const SLIDE_MS = 8000;
// Matches the CSS fade, so the outgoing text finishes before the next shows
const FADE_MS = 450;

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

export function startOpenSourceCarousel(root) {
  const slides = [...root.querySelectorAll(".p-open-source__slide")];
  const images = [...root.querySelectorAll(".p-open-source__image")];
  const pauseButtons = [...root.querySelectorAll(".js-open-source-pause")];
  const previous = root.querySelector('[aria-label="Previous slide"]');
  const next = root.querySelector('[aria-label="Next slide"]');
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

  let index = 0;
  let shown = 0;
  let playing = true;
  let elapsed = 0;
  let onScreen = true;
  let frame = null;
  let last = null;
  let swapTimer = null;

  const held = () => !onScreen || document.hidden;

  function draw() {
    const scale = `scaleX(${Math.min(elapsed / SLIDE_MS, 1)})`;
    bars[index].style.transform = scale;
    if (phoneBar) {
      phoneBar.style.transform = scale;
    }
  }

  function tick(now) {
    frame = null;
    if (last !== null) {
      elapsed += now - last;
    }
    last = now;
    if (elapsed >= SLIDE_MS) {
      go((index + 1) % slides.length);
    } else {
      draw();
    }
    schedule();
  }

  function schedule() {
    const shouldRun = playing && !held();
    if (shouldRun && frame === null) {
      frame = window.requestAnimationFrame(tick);
    } else if (!shouldRun && frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
      last = null;
    }
  }

  function showSlide() {
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
      slide.classList.remove("is-leaving");
    });
    shown = index;
  }

  function go(target, instant = false) {
    index = target;
    elapsed = 0;
    bars.forEach((bar) => {
      bar.style.transform = "";
    });
    if (phoneBar) {
      phoneBar.style.transform = "";
    }
    images.forEach((image, i) =>
      image.classList.toggle("is-active", i === index),
    );
    titles.forEach((title, i) =>
      title.setAttribute("aria-expanded", String(i === index)),
    );

    window.clearTimeout(swapTimer);
    if (instant || prefersReducedMotion() || shown === index) {
      showSlide();
    } else {
      slides[shown].classList.add("is-leaving");
      swapTimer = window.setTimeout(showSlide, FADE_MS);
    }
  }

  function renderPause() {
    const label = playing ? "Pause carousel" : "Play carousel";
    pauseButtons.forEach((button) => {
      button.setAttribute("aria-label", label);
      const icon = button.querySelector("i");
      icon.className = playing ? "p-icon--pause" : "p-icon--play";
    });
  }

  function setPlaying(value) {
    playing = value;
    renderPause();
    schedule();
  }

  // A visitor's choice always pauses, and is announced
  function choose(target) {
    go(target);
    setPlaying(false);
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
      target = (current + NAV_KEYS[event.key] + titles.length) % titles.length;
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
  previous.addEventListener("click", () =>
    choose((index - 1 + slides.length) % slides.length),
  );
  next.addEventListener("click", () => choose((index + 1) % slides.length));
  pauseButtons.forEach((button) =>
    button.addEventListener("click", () => setPlaying(!playing)),
  );
  list.addEventListener("keydown", onKeydown);
  document.addEventListener("visibilitychange", schedule);
  if ("IntersectionObserver" in window) {
    new window.IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      schedule();
    }).observe(root);
  }
  onReducedMotionChange((reduced) => reduced && setPlaying(false));

  // The no-JS :target state is replaced by this one
  const hashed = slides.findIndex((slide) => `#${slide.id}` === location.hash);
  if (hashed !== -1) {
    window.history.replaceState(null, "", location.pathname + location.search);
  }
  go(Math.max(hashed, 0), true);
  root.classList.add("is-enhanced");
  playing = hashed === -1 && !prefersReducedMotion();
  renderPause();
  schedule();
}
