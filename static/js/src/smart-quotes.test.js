import { applySmartQuotes } from "./smart-quotes.js";

describe("applySmartQuotes", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("handles a null root safely", () => {
    expect(() => applySmartQuotes(null)).not.toThrow();
  });

  it("skips processing when root or an ancestor is marked", () => {
    document.body.innerHTML = [
      '<div id="marked-root" data-no-smartquotes="true">',
      '  <p id="direct">"direct"</p>',
      '  <div id="nested-root"><span id="child">"child"</span></div>',
      "</div>",
    ].join("\n");

    applySmartQuotes(document.getElementById("marked-root"));
    applySmartQuotes(document.getElementById("nested-root"));

    expect(document.getElementById("direct")?.textContent).toBe('"direct"');
    expect(document.getElementById("child")?.textContent).toBe('"child"');
  });

  it("skips [data-no-smartquotes] subtrees", () => {
    const singleQuotedCmd = "printf '%s\\n'";
    const escapedDoubleFlag = '--u32 "0&gt;&gt;24"';
    const expectedDoubleFlag = '--u32 "0>>24"';

    document.body.innerHTML = [
      '<main id="main-content">',
      '  <p id="prose">Ubuntu "noble" release notes</p>',
      '  <div id="cve-content" data-no-smartquotes="true">',
      `    <p id="mitigation">${singleQuotedCmd} ${escapedDoubleFlag}</p>`,
      "  </div>",
      "</main>",
    ].join("\n");

    applySmartQuotes(document.getElementById("main-content"));

    const prose = document.getElementById("prose")?.textContent;
    expect(prose).toBe("Ubuntu \u201cnoble\u201d release notes");

    const mitigation = document.getElementById("mitigation")?.textContent;
    expect(mitigation).toBe(`${singleQuotedCmd} ${expectedDoubleFlag}`);
  });

  it("preserves DOM order and nested exclusions", () => {
    const innerSingle = "'inner'";

    document.body.innerHTML = [
      '<main id="main-content">',
      '  <section id="first">"first"</section>',
      '  <section id="second" data-no-smartquotes="true">',
      '    <p id="outer">"outer"</p>',
      '    <div data-no-smartquotes="true">',
      `      <p id="inner">${innerSingle}</p>`,
      "    </div>",
      "  </section>",
      '  <section id="third">"third"</section>',
      "</main>",
    ].join("\n");

    const main = document.getElementById("main-content");
    applySmartQuotes(main);

    const ids = main ? Array.from(main.children).map((el) => el.id) : [];
    expect(ids).toEqual(["first", "second", "third"]);
    expect(document.getElementById("first")?.textContent).toBe(
      "\u201cfirst\u201d",
    );
    expect(document.getElementById("outer")?.textContent).toBe('"outer"');
    expect(document.getElementById("inner")?.textContent).toBe(innerSingle);
    expect(document.getElementById("third")?.textContent).toBe(
      "\u201cthird\u201d",
    );
  });
});
