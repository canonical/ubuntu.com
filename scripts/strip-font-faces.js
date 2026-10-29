// Removes @font-face rules from a CSS file, in place. cookie-policy.css ships
// its own copy of Vanilla's fonts, which would replace the local ones.
const fs = require("fs");
const postcss = require("postcss");

function stripFontFaces(css) {
  const root = postcss.parse(css);
  root.walkAtRules("font-face", (rule) => rule.remove());
  return root.toString();
}

if (require.main === module) {
  const file = process.argv[2];
  fs.writeFileSync(file, stripFontFaces(fs.readFileSync(file, "utf8")));
}

module.exports = { stripFontFaces };
