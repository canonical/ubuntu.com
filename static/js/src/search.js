/**
 * This script attempts to catch bot submissions by checking if a honeypot field has a value.
 */
document.addEventListener("DOMContentLoaded", function () {
  const searchForms = document.querySelectorAll("form.js-search-form");
  searchForms.forEach(function (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const honeyPotField = searchForm.querySelector("input[name='search']");
      // If the honeypot field has a value, it might be a bot, so redirect
      if (honeyPotField && honeyPotField.value !== "") {
        console.log("Honeypot field has a value, redirecting to search page");
        window.location.replace("/search");
        return;
      }
      // Remove the honeypot field before manual submission
      if (honeyPotField) {
        console.log("Removing honeypot field", honeyPotField);
        honeyPotField.remove();
      }
      searchForm.submit();
    });
  });
});
