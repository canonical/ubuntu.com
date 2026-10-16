import { prefersReducedMotion, onReducedMotionChange } from "./reduced-motion";
import { createTypewriter } from "./typewriter";

export const SLIDE_MS = 8000;

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

  let index = 0;
  // Autoplay only: Pause or a visitor's choice stops the slides advancing,
  // the command keeps typing either way
  let playing = true;
  // The slide under the pointer, -1 for none; the active one holds the timer
  let hovered = -1;
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
    const held = hovered === index;
    const running = playing && !held && visible();
    // The rule turns solid while the pointer holds the slide, and for a slide
    // chosen with autoplay off, whose bar would otherwise stay empty. A
    // paused bar that has started keeps showing its progress.
    root.classList.toggle("is-held", held || (!playing && elapsed === 0));
    if (running && frame === null) {
      frame = window.requestAnimationFrame(tick);
    } else if (!running && frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
      last = null;
    }

    const label = playing ? "Pause carousel" : "Play carousel";
    const icon = playing ? "pause" : "play";
    pauseButtons.forEach((button) => {
      button.setAttribute("aria-label", label);
      button
        .querySelectorAll("[data-icon]")
        .forEach((img) => (img.hidden = img.dataset.icon !== icon));
    });

    const typing = !prefersReducedMotion();
    writers.forEach((writer, i) => {
      if (!writer) {
        return;
      }
      if (i !== index || !typing) {
        writer.reset();
      } else if (visible()) {
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

  function setPlaying(next) {
    playing = next;
    sync();
  }

  // A visitor's choice stops autoplay (not a Pause), and is announced
  function choose(target) {
    playing = false;
    go(target);
    live.textContent = `Slide ${target + 1} of ${slides.length}: ${
      titles[target].textContent
    }`;
  }

  function onKeydown(event) {
    const current = titles.indexOf(event.target);
    const targets = {
      ArrowUp: wrap(current - 1),
      ArrowLeft: wrap(current - 1),
      ArrowDown: wrap(current + 1),
      ArrowRight: wrap(current + 1),
      Home: 0,
      End: titles.length - 1,
    };
    if (current !== -1 && event.key in targets) {
      event.preventDefault();
      titles[targets[event.key]].focus();
    }
  }

  titles.forEach((title, i) =>
    title.addEventListener("click", () => choose(i)),
  );
  function hover(target) {
    if (target !== hovered) {
      hovered = target;
      sync();
    }
  }
  list.addEventListener("pointermove", (event) =>
    hover(slides.findIndex((slide) => slide.contains(event.target))),
  );
  list.addEventListener("pointerleave", () => hover(-1));
  root
    .querySelectorAll(".js-open-source-step")
    .forEach((button) =>
      button.addEventListener("click", () =>
        choose(wrap(index + Number(button.dataset.step))),
      ),
    );
  pauseButtons.forEach((button) =>
    button.addEventListener("click", () => setPlaying(!playing)),
  );
  list.addEventListener("keydown", onKeydown);
  // Keyboard focus inside stops autoplay, so a focused title or link is never
  // hidden under it; only Play resumes (WAI-ARIA carousel pattern)
  root.addEventListener("focusin", (event) => {
    if (event.target.matches(":focus-visible")) {
      setPlaying(false);
    }
  });
  document.addEventListener("visibilitychange", sync);
  if ("IntersectionObserver" in window) {
    new window.IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      sync();
    }).observe(root);
  }
  onReducedMotionChange((reduced) => reduced && setPlaying(false));

  // The no-JS :target state is replaced by this one
  const hashed = [...root.querySelectorAll(".p-open-source__anchor")].findIndex(
    (anchor) => `#${anchor.id}` === location.hash,
  );
  if (hashed !== -1) {
    window.history.replaceState(null, "", location.pathname + location.search);
  }
  playing = hashed === -1 && !prefersReducedMotion();
  go(Math.max(hashed, 0));
  root.classList.add("is-enhanced");
}
