/**
 * Filters and pages the Developer diaries articles without reloading the
 * page, so it doesn't jump around: fetches the server-rendered page of the
 * new URL and swaps in only its results (cards and pagination).
 *
 * Without JavaScript, the filter form and pagination links still work as
 * plain page loads.
 */

const form = document.querySelector(".js-topic-filters");
const results = document.querySelector(".js-articles-results");
const section = document.getElementById("articles");
let controller;
// Query string of the results on display, to tell history entries apart
let shownSearch = window.location.search;

function syncCheckboxes(url) {
  const topics = url.searchParams.getAll("topic");
  form.querySelectorAll("input[name=topic]").forEach((input) => {
    input.checked = topics.includes(input.value);
  });
}

async function showResults(href, { push = true, scrollToTop = false } = {}) {
  const url = new URL(href, window.location.href);

  // Only the latest request wins when filters change in quick succession
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();
  const { signal } = controller;
  results.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const page = new DOMParser().parseFromString(
      await response.text(),
      "text/html",
    );
    const newResults = page.querySelector(".js-articles-results");
    if (!newResults) {
      throw new Error("No results in the response");
    }

    results.replaceChildren(...newResults.childNodes);
    shownSearch = url.search;
    syncCheckboxes(url);
    if (push) {
      window.history.pushState(null, "", url);
    }

    // When paging from the bottom of the list, bring the new page's first
    // cards into view. Focus the results, as the clicked link is gone.
    if (scrollToTop) {
      results.focus({ preventScroll: true });
      if (results.getBoundingClientRect().top < 0) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      // Fall back to a normal page load
      window.location.assign(url);
    }
  } finally {
    if (!signal.aborted) {
      results.removeAttribute("aria-busy");
    }
  }
}

if (form && results && section) {
  results.setAttribute("tabindex", "-1");

  form.addEventListener("change", () => {
    const url = new URL(window.location.pathname, window.location.href);
    new FormData(form).forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    url.hash = "articles";
    showResults(url);
  });

  results.addEventListener("click", (event) => {
    const link = event.target.closest(".p-pagination a");
    if (!link) {
      return;
    }

    event.preventDefault();
    showResults(link.href, { scrollToTop: true });
  });

  // Back and forward between filters and pages; ignore hash-only changes
  window.addEventListener("popstate", () => {
    if (window.location.search !== shownSearch) {
      showResults(window.location.href, { push: false });
    }
  });
}
