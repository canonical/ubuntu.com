(function() {
  const tabLinks = document.querySelectorAll(".p-tabs__link");
  const tabContent = document.querySelectorAll(".p-tabs__content");

  tabContent.forEach(tab => {
    tab.classList.add('u-hide');
  });

  tabLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const panelToOpen = e.target.getAttribute('aria-controls');
      if (panelToOpen) {
        tabClickHandler(e.target, panelToOpen);
      }
    });
    if (link.getAttribute('aria-selected') == "true") {
      link.click();
    }
  });

  function tabClickHandler(tabElement, panelToOpen) {
    const container = tabElement.closest('.js-tab-container');
    const tabLinks = container.querySelectorAll('.p-tabs__link');
    const panels = container.querySelectorAll('.p-tabs__content');
    const panelElement = container.querySelector(`#${panelToOpen}`);
    tabLinks.forEach(link => {
      link.setAttribute("aria-selected", false);
    });
    tabElement.setAttribute("aria-selected", true);
    panels.forEach(panel => {
      panel.classList.add('u-hide');
    });
    panelElement.classList.remove('u-hide');
  }
})();
