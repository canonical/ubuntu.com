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
    link.addEventListener("click", function (event) {
      if (link.dataset.nohash) {
        const target = link.getAttribute("aria-controls");

        event.preventDefault();
        setActiveTab(false, `#${target}`);
      } else {
        setActiveTab(true);
      }
    });
  });

  document.addEventListener("DOMContentLoaded", setActiveTab());

  window.addEventListener(
    "hashchange",
    function () {
      setActiveTab(true);
    },
    false
  );

  function setActiveTab(scroll, target) {
    const hash = target || window.location.hash;

    tabLinks.forEach((link) => {
      if (hash) {
        const id = link.getAttribute("aria-controls");
        const tabContent = document.getElementById(id);

        if (`#${id}` === hash) {
          link.setAttribute("aria-selected", true);
          tabContent.classList.remove("u-hide");

          if (scroll) {
            tabContent.scrollIntoView();
          }
        } else {
          link.setAttribute("aria-selected", false);
          tabContent.classList.add("u-hide");
        }
      }
    });
  }
}

initTabs();
