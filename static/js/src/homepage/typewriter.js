function span(className, text) {
  const node = document.createElement("span");
  node.className = className;
  node.textContent = text;
  return node;
}

// "$ sudo snap install a/b --flag/c": the text before the slash list stays,
// and each name in the list is typed, held, deleted, then the next one
// starts. A name's flags show beside it as it types, without being typed.
// Until start() the element keeps its server-rendered full list.
export function createTypewriter(el, { typeMs = 90, holdMs = 1500 } = {}) {
  const staticHtml = el.innerHTML;
  const staticText = el.textContent;
  // The list starts at the first word with a slash (or the last word),
  // stepping back past any flags to the name they belong to
  const tokens = staticText.split(" ");
  let first = tokens.findIndex((token) => token.includes("/"));
  if (first === -1) {
    first = tokens.length - 1;
  }
  while (first > 0 && tokens[first].startsWith("-")) {
    first -= 1;
  }
  const prefix = tokens.slice(0, first).join(" ") + " ";
  const items = tokens.slice(first).join(" ").split("/");
  const words = items.map((item) => item.split(" ")[0]);
  const flags = items.map((item, i) => item.slice(words[i].length));
  let typed = null;
  let flag = null;
  let wordIndex = 0;
  let chars = 0;
  let phase = "typing";
  let timer = null;

  // Screen readers get the full list once, the keystrokes are hidden. The
  // word and cursor wrap as one, so a hyphenated name never splits.
  function build() {
    typed = document.createElement("span");
    const word = span("p-open-source__nowrap", "");
    word.append(typed, span("p-open-source__cursor", ""));
    const visible = document.createElement("span");
    visible.setAttribute("aria-hidden", "true");
    flag = document.createTextNode(flags[0]);
    visible.append(prefix, word, flag);
    el.replaceChildren(visible, span("u-off-screen", staticText));
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
    typed.textContent = words[wordIndex].slice(0, chars);
    flag.textContent = flags[wordIndex];
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
