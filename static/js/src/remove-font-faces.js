export function removeFontFaces(sheet) {
  for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
    if (sheet.cssRules[i].type === CSSRule.FONT_FACE_RULE) {
      sheet.deleteRule(i);
    }
  }
}
