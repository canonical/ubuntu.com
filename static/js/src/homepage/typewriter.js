const PREFIX = "$ sudo snap install ";

function span(className, text) {
  const node = document.createElement("span");
  node.className = className;
  node.textContent = text;
  return node;
}

// Types each word after the fixed prefix, holds it, deletes it, then moves on.
// Until start() the element keeps its server-rendered full list.
export function createTypewriter(
  el,
  words,
  { typeMs = 90, holdMs = 1500 } = {},
) {
  const staticHtml = el.innerHTML;
  const staticText = el.textContent;
  let typed = null;
  let wordIndex = 0;
  let chars = 0;
  let phase = "typing";
  let timer = null;

  // Screen readers get the full list once, the keystrokes are hidden
  function build() {
    typed = document.createElement("span");
    const visible = document.createElement("span");
    visible.setAttribute("aria-hidden", "true");
    visible.append(PREFIX, typed, span("p-open-source__cursor", ""));
    el.replaceChildren(visible, span("u-off-screen", staticText));
  }

  function render() {
    typed.textContent = words[wordIndex].slice(0, chars);
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
      chars -= 1;
      if (chars === 0) {
        wordIndex = (wordIndex + 1) % words.length;
        phase = "typing";
      }
    }
    render();
    timer = window.setTimeout(step, delay);
  }

  function start() {
    if (timer !== null) {
      return;
    }
    if (!typed) {
      build();
      render();
    }
    timer = window.setTimeout(step, typeMs);
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

  return { start, stop, reset };
}
