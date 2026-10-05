// Vanilla shows the tooltip on :hover and :focus; this adds Escape to hide it
// until the pointer or focus leaves.
export function startIconTooltip(root) {
  const message = root.querySelector(".p-tooltip__message");
  if (!message) {
    return;
  }

  const reset = () => {
    message.style.display = "";
  };

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      message.style.display = "none";
    }
  });
  root.addEventListener("mouseleave", reset);
  root.addEventListener("focusout", reset);
}
