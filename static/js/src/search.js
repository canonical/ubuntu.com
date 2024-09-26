/**
 * This script attempts to catch bot submissions by checking if a honeypot field has a value.
 */
document.addEventListener("DOMContentLoaded", function () {
  const searchForms = document.querySelectorAll("form.js-search-form");
  searchForms.forEach(function (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const honeyPotField = searchForm.querySelector("input[name='search']");
      if (honeyPotField && honeyPotField.value !== "") {
        window.location.replace("/search");
        return;
      }
      if (honeyPotField) {
        honeyPotField.remove();
      }
      searchForm.submit();
    });
  });
});
