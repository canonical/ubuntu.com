const topicsFilter = document.getElementById("tutorials-topic");
const sortFilter = document.getElementById("tutorials-sort");
const searchFilter = document.getElementById("tutorials-search");
const searchInput = document.getElementById("tutorials-search-input");
const urlObj = new URL(window.location);

function handleFilter(key, el, url) {
  if (!el) {
    return;
  }

  if (url.searchParams.has(key)) {
    el.value = url.searchParams.get(key);
  }

  el.addEventListener("change", (e) => {
    const value = e.target.value;

    if (url.searchParams.has("page")) {
      url.searchParams.delete("page");
    }

    if (value) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
      }

      url.searchParams.append(key, value);
    } else {
      url.searchParams.delete(key);
    }

    window.location = url;
  });
}

function setUpSearch(form, input, url) {
  if (!form || !input) {
    return;
  }

  if (url.searchParams.has("q")) {
    input.value = url.searchParams.get("q");
  } else {
    input.value = "";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (url.searchParams.has("page")) {
      url.searchParams.delete("page");
    }
    if (url.searchParams.has("q")) {
      url.searchParams.delete("q");
    }
    url.searchParams.append("q", input.value);
    window.location = url;
  });

  form.addEventListener("reset", (e) => {
    e.preventDefault();
    if (url.searchParams.has("page")) {
      url.searchParams.delete("page");
    }
    url.searchParams.delete("q");
    window.location = url;
  });
}

handleFilter("topic", topicsFilter, urlObj);
handleFilter("sort", sortFilter, urlObj);
setUpSearch(searchFilter, searchInput, urlObj);

export { handleFilter, setUpSearch };
