(function () {
  const tabLinks = document.querySelectorAll(".p-tabs__link");
  const tabContent = document.querySelectorAll(".p-tabs__content");

  tabContent.forEach((tab) => {
    const link = document.querySelector(
      `#${tab.getAttribute("aria-labelledby")}`
    );
    if (link && link.getAttribute("aria-selected") !== "true") {
      tab.classList.add("u-hide");
    }
  });

  tabLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const panelToOpen = e.target.getAttribute("aria-controls");
      if (panelToOpen) {
        tabClickHandler(e.target, panelToOpen);
      }
    });
  });

  function tabClickHandler(tabElement, panelToOpen) {
    const container = tabElement.closest(".js-tab-container");
    const tabLinks = container.querySelectorAll(".p-tabs__link");
    const panels = container.querySelectorAll(".p-tabs__content");
    const panelElement = container.querySelector(`#${panelToOpen}`);
    tabLinks.forEach((link) => {
      link.setAttribute("aria-selected", false);
    });
    tabElement.setAttribute("aria-selected", true);
    panels.forEach((panel) => {
      panel.classList.add("u-hide");
    });
    panelElement.classList.remove("u-hide");
    // Hack to fix a graph sizing bug:
    // The size is defined by the container, but on hidden tabs it falls back
    // on the next parent which is smaller than the container it is in when
    // not hidden
    if (panelElement.querySelector("svg[class='chart']")) {
      window.dispatchEvent(new Event("resize"));
    }
    panelElement.scrollIntoView();
  }

  function hashChange() {
    const id = window.location.hash.replace("#", "");
    const tab = document.querySelector(`[aria-controls="${id}"]`);
    if (tab) {
      tabClickHandler(tab, id);
    }
  }

  window.addEventListener("hashchange", function () {
    hashChange();
  });
})();
