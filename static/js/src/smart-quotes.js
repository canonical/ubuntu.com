var smartquotes = require("smartquotes");

/**
 * Apply smartquotes to a container while skipping any [data-no-smartquotes]
 * subtrees so technical content (such as CVE commands and configs) retains
 * literal ASCII quotes.
 *
 * @param {HTMLElement | null} root - Root container element to process.
 */
export function applySmartQuotes(root) {
  if (!root) {
    return;
  }

  const nodes = Array.from(root.querySelectorAll("[data-no-smartquotes]"));
  const excluded = nodes.filter(
    (element) =>
      !element.parentElement ||
      !element.parentElement.closest("[data-no-smartquotes]"),
  );

  const placeholders = excluded
    .map((element) => {
      const parent = element.parentNode;
      if (!parent) {
        return null;
      }
      const placeholder = document.createComment("no-smartquotes");
      parent.replaceChild(placeholder, element);
      return { element, placeholder };
    })
    .filter((entry) => entry !== null);

  smartquotes(root);

  placeholders.reverse().forEach((entry) => {
    if (entry && entry.placeholder.parentNode) {
      entry.placeholder.parentNode.replaceChild(
        entry.element,
        entry.placeholder,
      );
    }
  });
}

applySmartQuotes(document.getElementById("main-content"));
