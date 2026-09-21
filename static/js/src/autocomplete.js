// Generic autocomplete dropdown (debounced fetch, ARIA combobox, keyboard
// nav, click-outside/blur-to-close). Reusable for any input + suggestions
// list pair on any page - the caller supplies what to fetch and how to
// label/fill each suggestion.
function initAutocomplete({
  inputSelector,
  suggestionsSelector,
  containerSelector,
  buildUrl,
  getLabel,
  getValue = getLabel,
  minChars = 3,
  maxSuggestions = 5,
  debounceMs = 200,
}) {
  const searchInput = document.querySelector(inputSelector);
  const suggestionsList = document.querySelector(suggestionsSelector);

  if (!searchInput || !suggestionsList) {
    return;
  }

  let debounceTimer = null;
  let abortController = null;
  let activeIndex = -1;

  function closeSuggestions() {
    clearTimeout(debounceTimer);
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    suggestionsList.innerHTML = "";
    suggestionsList.classList.add("u-hide");
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
    activeIndex = -1;
  }

  function selectSuggestion(value) {
    searchInput.value = value;
    closeSuggestions();
    searchInput.focus();
  }

  function setActiveOption(index) {
    const options = suggestionsList.querySelectorAll("li");
    if (!options.length) {
      return;
    }

    options.forEach((option) => {
      option.setAttribute("aria-selected", "false");
      option.classList.remove("is-active");
    });

    activeIndex = (index + options.length) % options.length;
    const activeOption = options[activeIndex];
    activeOption.setAttribute("aria-selected", "true");
    activeOption.classList.add("is-active");
    searchInput.setAttribute("aria-activedescendant", activeOption.id);
  }

  function renderSuggestions(suggestions) {
    suggestionsList.innerHTML = "";
    activeIndex = -1;

    if (!suggestions || suggestions.length === 0) {
      closeSuggestions();
      return;
    }

    suggestions.slice(0, maxSuggestions).forEach((suggestion, index) => {
      const option = document.createElement("li");
      option.id = `${suggestionsList.id}-option-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      const label = getLabel(suggestion);
      const value = getValue(suggestion);
      option.textContent = label;
      option.dataset.value = value;
      // mousedown fires before the input's blur event, so the click
      // still registers before the dropdown would otherwise be closed
      option.addEventListener("mousedown", (e) => {
        e.preventDefault();
        selectSuggestion(value);
      });
      suggestionsList.appendChild(option);
    });

    suggestionsList.classList.remove("u-hide");
    searchInput.setAttribute("aria-expanded", "true");
  }

  function fetchSuggestions(term) {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    fetch(buildUrl(term), { signal: abortController.signal })
      .then((res) => res.json())
      .then((data) => renderSuggestions(data.suggestions))
      .catch((error) => {
        // A newer request superseding this one is expected, not a failure
        if (error.name !== "AbortError") {
          closeSuggestions();
        }
      });
  }

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim();

    clearTimeout(debounceTimer);
    if (abortController) {
      abortController.abort();
      abortController = null;
    }

    if (term.length < minChars) {
      closeSuggestions();
      return;
    }

    debounceTimer = setTimeout(() => fetchSuggestions(term), debounceMs);
  });

  searchInput.addEventListener("keydown", (e) => {
    const options = suggestionsList.querySelectorAll("li");
    if (!options.length) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveOption(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveOption(activeIndex - 1);
    } else if (e.key === "Enter" && activeIndex > -1) {
      e.preventDefault();
      selectSuggestion(options[activeIndex].dataset.value);
    } else if (e.key === "Escape") {
      closeSuggestions();
    }
  });

  // Ensures keyboard users (tabbing away) also dismiss the popup, not just
  // pointer clicks outside it
  searchInput.addEventListener("blur", closeSuggestions);

  document.addEventListener("click", (e) => {
    if (!e.target.closest(containerSelector)) {
      closeSuggestions();
    }
  });
}
