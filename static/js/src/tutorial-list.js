const topicsFilter = document.getElementById("tutorials-topic");
const sortFilter = document.getElementById("tutorials-sort");
const searchFilter = document.getElementById("tutorials-search");
const searchInput = document.getElementById("tutorials-search-input");
const urlObj = new URL(window.location);

if (urlObj.searchParams.has("q")) {
  searchInput.value = urlObj.searchParams.get("q");
} else {
  searchInput.value = "";
}

searchFilter.addEventListener("submit", (e) => {
  e.preventDefault();
  if (urlObj.searchParams.has("page")) {
    urlObj.searchParams.delete("page");
  }
  if (urlObj.searchParams.has("q")) {
    urlObj.searchParams.delete("q");
  }
  urlObj.searchParams.append("q", searchInput.value);
  window.location = urlObj;
});

searchFilter.addEventListener("reset", (e) => {
  e.preventDefault();
  if (urlObj.searchParams.has("page")) {
    urlObj.searchParams.delete("page");
  }
  console.log("reset");
  urlObj.searchParams.delete("q");
  window.location = urlObj;
});

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

handleFilter("topic", topicsFilter, urlObj);
handleFilter("sort", sortFilter, urlObj);

export { handleFilter };
