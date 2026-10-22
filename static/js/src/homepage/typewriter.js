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

// Types a command's options in turn: the code element's data-prefix stays,
// and each [data-type] string is typed, held, deleted, then the next one
// starts. Until start() the element keeps its server-rendered full list.
export function createTypewriter(el, { typeMs = 90, holdMs = 1500 } = {}) {
  const staticHtml = el.innerHTML;
  const staticText = el.textContent;
  const prefix = el.dataset.prefix;
  const words = [...el.querySelectorAll("[data-type]")].map(
    ({ dataset }) => dataset.type,
  );
  // How much of each word stays when moving on to the next: what they share,
  // retyping at least one character so a lone word still clears
  const keeps = words.map((word, i) => {
    const next = words[(i + 1) % words.length];
    return words.length === 1
      ? 0
      : Math.min(sharedLength(word, next), next.length - 1);
  });
  // From the lead-in until the last word has been typed and held
  const durationMs = words.reduce((total, word, i) => {
    const typing = (word.length - (i ? keeps[i - 1] : 0) - 1) * typeMs + holdMs;
    const deleting =
      i < words.length - 1 ? (word.length - keeps[i]) * typeMs : 0;
    return total + typing + deleting;
  }, holdMs);
  let typed = null;
  let cursor = null;
  let wordIndex = 0;
  let chars = 0;
  let phase = "typing";
  let timer = null;

  // Screen readers get the full list once, the keystrokes are hidden
  function build() {
    typed = document.createElement("span");
    cursor = span("p-open-source__cursor", "");
    typed.setAttribute("aria-hidden", "true");
    el.replaceChildren(typed, span("u-off-screen", staticText));
    render();
  }

  // Each space-separated part stays whole, so a hyphenated name never splits
  // but a long command can still wrap between a name and its flags. The
  // cursor rides with the last part.
  function render() {
    const parts = words[wordIndex].slice(0, chars).split(" ");
    const spans = parts.map((part) => span("p-open-source__nowrap", part));
    spans[spans.length - 1].append(cursor);
    typed.replaceChildren(
      prefix,
      ...spans.flatMap((part, i) => (i ? [" ", part] : [part])),
    );
  }

  function step() {
    let delay = typeMs;
    if (phase === "typing") {
      chars += 1;
      if (chars === words[wordIndex].length) {
        phase = "deleting";
        delay = holdMs;
      }
    } else {
      if (chars > keeps[wordIndex]) {
        chars -= 1;
      }
      if (chars === keeps[wordIndex]) {
        wordIndex = (wordIndex + 1) % words.length;
        phase = "typing";
      }
    }
    render();
    timer = window.setTimeout(step, delay);
  }

  // A fresh start blinks the cursor for holdMs first, so a panel that is
  // still opening shows the prompt before the typing begins
  function start() {
    if (timer !== null) {
      return;
    }
    if (!typed) {
      build();
    }
    // A stop during the lead-in (e.g. the section scrolled off before typing
    // began) restarts it, keeping the typing in step with durationMs
    const leadIn = wordIndex === 0 && chars === 0;
    timer = window.setTimeout(step, leadIn ? holdMs : typeMs);
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
    wordIndex = 0;
    chars = 0;
    phase = "typing";
  }

  return { start, stop, reset, durationMs };
}
