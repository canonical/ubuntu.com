import { toggleDrawer } from "./side-navigation.js";

function setUpDynamicSideNav() {
  const sideNavigationElement = document.querySelector(".js-dynamic-toc");
  const sideNavigationToggle = document.querySelector(".js-drawer-toggle");
  const sections = Array.prototype.slice.call(
    document.querySelectorAll(".section-heading"),
  );
  const navigationLinks = Array.prototype.slice.call(
    document.querySelectorAll(".highlight-link"),
  );
  navigationLinks.forEach(function (link) {
    link.addEventListener("click", () =>
      toggleDrawer(sideNavigationElement, false),
    );
  });
  sideNavigationToggle.addEventListener("click", () =>
    toggleDrawer(sideNavigationElement, true),
  );

  sections.forEach(function (section) {
    const observer = new IntersectionObserver(
      function (entry) {
        if (entry[0].isIntersecting) {
          const sectionId = entry[0].target.id;
          navigationLinks.forEach(function (link) {
            if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("is-active");
            } else {
              link.classList.remove("is-active");
            }
          });
        }
      },
      {
        rootMargin: "-5% 0px -87% 0px",
        threshold: 0.5,
      },
    );

    observer.observe(section);
  });
}
setUpDynamicSideNav();
