var smartquotes = require("smartquotes");

/**
 * Apply smartquotes to a container while skipping any [data-no-smartquotes]
 * subtrees so technical content (such as CVE commands and configs) retains
 * literal ASCII quotes.
 *
 * @param {HTMLElement | null} root - Root container element to process.
 */
export function applySmartQuotes(root) {
  if (!root || root.closest("[data-no-smartquotes]")) {
    return;
  }

  const nodes = Array.from(root.querySelectorAll("[data-no-smartquotes]"));
  const excluded = nodes.filter(
    (element) =>
      !element.parentElement ||
      !element.parentElement.closest("[data-no-smartquotes]"),
  );

  const placeholders = excluded.map((element) => {
    const placeholder = document.createComment("no-smartquotes");
    element.replaceWith(placeholder);
    return { element, placeholder };
  });

  smartquotes(root);

  placeholders.reverse().forEach((entry) => {
    entry.placeholder.replaceWith(entry.element);
  });
}

applySmartQuotes(document.getElementById("main-content"));
