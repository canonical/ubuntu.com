// Vanilla shows the tooltip on :hover and :focus; this adds Escape to hide it,
// whether the icon is hovered or focused, until both pointer and focus leave.
export function startIconTooltip(root) {
  const message = root.querySelector(".p-tooltip__message");
  if (!message) {
    return;
  }

  let isHovered = false;
  const hasFocus = () => root.contains(document.activeElement);

  const hide = (event) => {
    if (event.key === "Escape") {
      message.style.display = "none";
    }
  };

  const resetUnlessActive = () => {
    if (!isHovered && !hasFocus()) {
      message.style.display = "";
    }
  };

  root.addEventListener("keydown", hide);
  root.addEventListener("mouseenter", () => {
    isHovered = true;
    document.addEventListener("keydown", hide);
  });
  root.addEventListener("mouseleave", () => {
    isHovered = false;
    document.removeEventListener("keydown", hide);
    resetUnlessActive();
  });
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget) && !isHovered) {
      message.style.display = "";
    }
  });
}
