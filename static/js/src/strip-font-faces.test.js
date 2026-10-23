const { stripFontFaces } = require("../../../scripts/strip-font-faces");

test("drops @font-face rules and keeps the rest", () => {
  const css =
    '@font-face{font-family:"Ubuntu variable";src:url(a.woff2)}' +
    ".cookie-policy{color:red}";
  expect(stripFontFaces(css)).toBe(".cookie-policy{color:red}");
});
