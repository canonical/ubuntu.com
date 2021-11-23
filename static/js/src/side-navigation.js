/**
 * Select all Side Navigation components: ".p-side-navigation"
 *  - Collapse/Expand side navigation using button ".js-drawer-toggle"
 *  - Handle active state of links ".p-side-navigation__link"
 */

const currentPath = window.location.pathname;
const navigations = document.querySelectorAll(".p-side-navigation");

/**
 Toggles the expanded/collapsed classed on side navigation element.

 @param {HTMLElement} sideNavigation The side navigation element.
 @param {Boolean} show Whether to show or hide the drawer.
 */
function toggleDrawer(sideNavigation, show) {
  if (sideNavigation) {
    if (show) {
      sideNavigation.classList.remove("is-collapsed");
      sideNavigation.classList.add("is-expanded");
    } else {
      sideNavigation.classList.remove("is-expanded");
      sideNavigation.classList.add("is-collapsed");
    }
  }
}

if (navigations && navigations.length > 0) {
  navigations.forEach(function (navigation) {
    const links = navigation.querySelectorAll(
      ".p-side-navigation .p-side-navigation__link"
    );
    if (links && links.length > -1) {
      links.forEach(function (link) {
        link.addEventListener("click", function () {
          links.forEach(function (link) {
            link.removeAttribute("aria-current");
          });
          this.setAttribute("aria-current", "page");
          this.blur();
          const isExpanded = navigation.classList.contains("is-expanded");
          if (isExpanded) {
            toggleDrawer(navigation, !isExpanded);
          }
        });

        if (link.getAttribute("href") === currentPath) {
          link.setAttribute("aria-current", "page");
        }
      });
    }

    const toggles = navigation.querySelectorAll(".js-drawer-toggle");
    if (toggles && toggles.length > 0) {
      toggles.forEach(function (toggle) {
        toggle.addEventListener("click", function (event) {
          event.preventDefault();
          const sideNav = document.getElementById(
            toggle.getAttribute("aria-controls")
          );

          if (sideNav) {
            toggleDrawer(sideNav, !sideNav.classList.contains("is-expanded"));
          }
        });
      });
    }
  });
}
