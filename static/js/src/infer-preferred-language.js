function getPrimaryParentLanguage() {
  /**
   * Get the primary parent language
   *
   * Get the user's default language, and if it's a sub-language,
   * infer the parent language - e.g. for "en-GB", infer "en"
   */
  var language =
    navigator.language ||
    navigator.userLanguage ||
    navigator.browserLanguage ||
    navigator.systemLanguage;

  if (language.indexOf("-") !== -1) {
    if (language !== "zh-TW") {
      language = language.split("-")[0];
    }
  }

  return language;
}

const preferredLanguageInput = document.querySelector("#preferredLanguage");

if (preferredLanguageInput) {
  preferredLanguageInput.value = getPrimaryParentLanguage() || "";
}
