function initTabs() {
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
    link.addEventListener("click", () => {
      setActiveTab();
    });
  });

  document.addEventListener("DOMContentLoaded", setActiveTab());

  window.addEventListener(
    "hashchange",
    () => {
      setActiveTab();
    },
    false
  );

  function setActiveTab() {
    const hash = window.location.hash;

    tabLinks.forEach((link) => {
      if (hash) {
        const id = link.getAttribute("aria-controls");
        const tabContent = document.getElementById(id);

        if (`#${id}` === hash) {
          link.setAttribute("aria-selected", true);
          tabContent.classList.remove("u-hide");
          tabContent.scrollIntoView();
        } else {
          link.setAttribute("aria-selected", false);
          tabContent.classList.add("u-hide");
        }
      }
    });
  }
}

initTabs();
