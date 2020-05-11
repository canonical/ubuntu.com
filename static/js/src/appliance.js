if (typeof appliance !== "undefined") {
  throw TypeError("Namespace 'appliance' not available");
}

var appliance = {};

appliance.updateURL = function(linkElement, selectElement) {
  linkElement.href = window.location.pathname + '/' + selectElement.value;
}

appliance.downloadFormsInit = function(downloadForms) {
  if (downloadForms) {
    downloadForms.forEach(function(container) {
      const linkElement = container.querySelector('.js-download-link');
      const selectElement = container.querySelector('.js-platform-select');
      if (linkElement && selectElement) {
        selectElement.addEventListener('change', function() {
          appliance.updateURL(linkElement, selectElement);
        });
      }
    });
  }
}

appliance.downloadFormsInit(document.querySelectorAll(".js-download"));
