function span(className, text) {
  const node = document.createElement("span");
  node.className = className;
  node.textContent = text;
  return node;
}

// "$ sudo snap install a/b/c": the text up to the last space stays, and each
// word of the slash list is typed, held, deleted, then the next one starts.
// Until start() the element keeps its server-rendered full list.
export function createTypewriter(el, { typeMs = 90, holdMs = 1500 } = {}) {
  const staticHtml = el.innerHTML;
  const staticText = el.textContent;
  const cut = staticText.lastIndexOf(" ") + 1;
  const prefix = staticText.slice(0, cut);
  const words = staticText.slice(cut).split("/");
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
    visible.append(prefix, typed, span("p-open-source__cursor", ""));
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

  // A fresh start blinks the cursor for holdMs first, so a panel that is
  // still opening shows the prompt before the typing begins
  function start() {
    if (timer !== null) {
      return;
    }
    const fresh = !typed;
    if (fresh) {
      build();
      render();
    }
    timer = window.setTimeout(step, fresh ? holdMs : typeMs);
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
