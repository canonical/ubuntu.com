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
      if (link.dataset.noscroll) {
        // prevent the page jumping around when switching tabs,
        // whilst still using :target
        // https://gist.github.com/pimterry/260841c2104f27cadc954a29b9873b96#file-disable-link-jump-with-workaround-js
        event.preventDefault();
        history.pushState({}, "", link.href);

        // Update the URL again with the same hash, then go back
        history.pushState({}, "", link.href);
        history.back();
        setActiveTab(false);
      } else {
        setActiveTab(true);
      }
    });
  });

  document.addEventListener("DOMContentLoaded", setActiveTab());

  window.addEventListener(
    "hashchange",
    function () {
      setActiveTab();
    },
    false
  );

  function setActiveTab(scroll) {
    var urlHash = window.location.hash;

    tabLinks.forEach((link) => {
      if (urlHash) {
        const id = link.getAttribute("aria-controls");
        const tabContent = document.getElementById(id);

        if (`#${id}` === urlHash) {
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
