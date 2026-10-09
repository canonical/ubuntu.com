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

  it("hides the message on Escape anywhere while the pointer is over it", () => {
    const { root, message } = renderTooltip();
    root.dispatchEvent(new MouseEvent("mouseenter"));

    pressKey(document.body, "Escape");

    expect(message.style.display).toBe("none");
  });

  it("ignores Escape elsewhere once the pointer has left", () => {
    const { root, message } = renderTooltip();
    root.dispatchEvent(new MouseEvent("mouseenter"));
    root.dispatchEvent(new MouseEvent("mouseleave"));

    pressKey(document.body, "Escape");

    expect(message.style.display).toBe("");
  });

  it("keeps the message hidden while focus stays after the pointer leaves", () => {
    const { root, message } = renderTooltip();
    root.focus();
    pressKey(root, "Escape");

    root.dispatchEvent(new MouseEvent("mouseleave"));

    expect(message.style.display).toBe("none");
  });
});
