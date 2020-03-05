(function() {
  const topicsFilter = document.getElementById("tutorials-topic");
  const sortFilter = document.getElementById("tutorials-sort");
  const urlObj = new URL(window.location);

  function handleFilter(key, el, url) {
    if (!el) {
      return;
    }

    if (url.searchParams.has(key)) {
      el.value = url.searchParams.get(key);
    }

    el.addEventListener("change", e => {
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
})();
