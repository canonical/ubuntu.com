function span(className, text) {
  const node = document.createElement("span");
  node.className = className;
  node.textContent = text;
  return node;
}

function sharedLength(a, b) {
  let n = 0;
  while (n < a.length && a[n] === b[n]) {
    n += 1;
  }
  return n;
}

// Frames of [text, ms]: type each word, hold it, delete to what the next shares
function timeline(words, typeMs, holdMs) {
  const frames = [];
  let durationMs = holdMs;
  let from = 0;
  words.forEach((word, i) => {
    const next = words[(i + 1) % words.length];
    // Always retype at least one character, and fully clear a lone word
    const keep =
      words.length === 1
        ? 0
        : Math.min(sharedLength(word, next), next.length - 1);
    for (let n = from + 1; n <= word.length; n += 1) {
      frames.push([word.slice(0, n), n === word.length ? holdMs : typeMs]);
    }
    // A slide lasts from the lead-in until its last word is typed and held
    if (i === words.length - 1) {
      durationMs = frames.reduce((total, [, ms]) => total + ms, holdMs);
    }
    for (let n = word.length - 1; n >= keep; n -= 1) {
      frames.push([word.slice(0, n), typeMs]);
    }
    from = keep;
  });
  // Later loops skip the first word's start, which the last word left typed
  return { frames, durationMs, loopStart: from };
}

// Types each [data-type] string in turn after the data-prefix, looping
export function createTypewriter(el, { typeMs = 90, holdMs = 1500 } = {}) {
  const staticHtml = el.innerHTML;
  const staticText = el.textContent;
  const prefix = el.dataset.prefix;
  const words = [...el.querySelectorAll("[data-type]")].map(
    ({ dataset }) => dataset.type,
  );
  const { frames, durationMs, loopStart } = timeline(words, typeMs, holdMs);
  let typed = null;
  let cursor = null;
  let index = -1;
  let timer = null;

  // Screen readers get the full list once, the keystrokes are hidden
  function build() {
    typed = document.createElement("span");
    cursor = span("p-open-source__cursor", "");
    typed.setAttribute("aria-hidden", "true");
    el.replaceChildren(typed, span("u-off-screen", staticText));
    render("");
  }

  // Parts split on spaces stay whole, so a name never breaks at a hyphen
  function render(text) {
    const spans = text.split(" ").map((p) => span("p-open-source__nowrap", p));
    spans[spans.length - 1].append(cursor);
    typed.replaceChildren(
      prefix,
      ...spans.flatMap((part, i) => (i ? [" ", part] : [part])),
    );
  }

  function step() {
    index = index + 1 < frames.length ? index + 1 : loopStart;
    const [text, delay] = frames[index];
    render(text);
    timer = window.setTimeout(step, delay);
  }

  // A fresh start, or a stop before typing began, blinks for holdMs first
  function start() {
    if (timer !== null) {
      return;
    }
    if (!typed) {
      build();
    }
    timer = window.setTimeout(step, index === -1 ? holdMs : typeMs);
  }

  function stop() {
    window.clearTimeout(timer);
    timer = null;
  }

  function reset() {
    stop();
    if (typed) {
      el.innerHTML = staticHtml;
      typed = null;
    }
    index = -1;
  }

  return { start, stop, reset, durationMs };
}
