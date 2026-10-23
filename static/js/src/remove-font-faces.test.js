import { removeFontFaces } from "./remove-font-faces";

describe("removeFontFaces", () => {
  it("removes @font-face rules and keeps the rest", () => {
    const style = document.createElement("style");
    style.textContent = `
      @font-face { font-family: "Ubuntu variable"; src: url("a.woff2"); }
      .global-nav { color: red; }
      @font-face { font-family: "Ubuntu Mono variable"; src: url("b.woff2"); }
    `;
    document.head.appendChild(style);

    removeFontFaces(style.sheet);

    const rules = [...style.sheet.cssRules].map((rule) => rule.cssText);
    expect(rules).toEqual([".global-nav {color: red;}"]);
  });
});
