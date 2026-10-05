import { startIconTooltip } from "./icon-tooltip";

function renderTooltip() {
  document.body.innerHTML = `
    <span class="js-icon-tooltip" tabindex="0">
      <img src="icon.png" alt="" />
      <span class="p-tooltip__message" role="tooltip">Slack</span>
    </span>
  `;
  const root = document.querySelector(".js-icon-tooltip");
  startIconTooltip(root);
  return { root, message: root.querySelector(".p-tooltip__message") };
}

function pressKey(element, key) {
  element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("startIconTooltip", () => {
  it("hides the message when Escape is pressed", () => {
    const { root, message } = renderTooltip();

    pressKey(root, "Escape");

    expect(message.style.display).toBe("none");
  });

  it("ignores other keys", () => {
    const { root, message } = renderTooltip();

    pressKey(root, "Enter");

    expect(message.style.display).toBe("");
  });

  it("shows the message again after the pointer leaves", () => {
    const { root, message } = renderTooltip();
    pressKey(root, "Escape");

    root.dispatchEvent(new MouseEvent("mouseleave"));

    expect(message.style.display).toBe("");
  });

  it("shows the message again after focus leaves", () => {
    const { root, message } = renderTooltip();
    pressKey(root, "Escape");

    root.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));

    expect(message.style.display).toBe("");
  });
});
