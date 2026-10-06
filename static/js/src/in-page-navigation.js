/**
 * Behaviour for Vanilla's in-page navigation pattern, rendered by the
 * vf_in_page_navigation macro with scope="manual". Adapted from Vanilla's
 * example script, which isn't shipped in the vanilla-framework package:
 * https://github.com/canonical/vanilla-framework/blob/main/templates/docs/examples/patterns/in-page-navigation/_in-page-navigation.js
 *
 * - Highlights the link of the section being read, and keeps it in view in
 *   the horizontally scrolling list of small and medium screens
 * - Smooth scrolls to a section when its link is clicked
 *
 * The dropdown toggle of small and medium screens is hidden in CSS, so it
 * isn't wired up here.
 */

const LARGE_BREAKPOINT = 1036;

function isLargeViewport() {
  return (
    Math.max(document.documentElement.clientWidth, window.innerWidth) >=
    LARGE_BREAKPOINT
  );
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function scrollNavItemIntoView(link) {
  // Only the horizontal layout of small and medium screens scrolls
  if (isLargeViewport()) {
    return;
  }

  const item = link.closest(".p-in-page-navigation__item");
  const list = link.closest(
    ".p-in-page-navigation__container > .p-in-page-navigation__list",
  );
  if (!item || !list) {
    return;
  }

  // Scroll the list itself rather than calling scrollIntoView, which can
  // interrupt the page scrolling to a clicked section
  const offset =
    item.getBoundingClientRect().left -
    list.getBoundingClientRect().left -
    parseFloat(window.getComputedStyle(item).scrollMarginLeft || 0);
  list.scrollTo({ left: list.scrollLeft + offset, behavior: "smooth" });
}

function initInPageNavigation(navRoot) {
  const links = Array.from(
    navRoot.querySelectorAll(".p-in-page-navigation__link"),
  );
  const headings = links
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter(Boolean);
  let navItemClicked = false;

  function setActiveLink(link) {
    links.forEach((navLink) => {
      navLink.classList.toggle("is-active", navLink === link);
    });
    scrollNavItemIntoView(link);
  }

  function onHeadingVisible(headingId) {
    const link = links.find((navLink) => navLink.hash === `#${headingId}`);
    const list = link && link.closest(".p-in-page-navigation__list");

    // Nested lists are hidden in the horizontal layout: keep the parent
    // section highlighted instead
    if (!list || window.getComputedStyle(list).display === "none") {
      return;
    }

    setActiveLink(link);
  }

  let observer;
  let observedLargeViewport;
  function observeHeadings() {
    const largeViewport = isLargeViewport();
    if (largeViewport === observedLargeViewport) {
      return;
    }
    observedLargeViewport = largeViewport;

    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(
      (entries) => {
        // Let a clicked link stay active while the page scrolls to it
        if (navItemClicked) {
          return;
        }
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry) => onHeadingVisible(entry.target.id));
      },
      {
        rootMargin: largeViewport ? "-10% 0px -50% 0px" : "-10% 0px -75% 0px",
        threshold: 0.5,
      },
    );
    headings.forEach((heading) => observer.observe(heading));
  }

  observeHeadings();
  window.addEventListener("resize", debounce(observeHeadings, 250));

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const heading = document.getElementById(link.hash.slice(1));
      if (!heading) {
        return;
      }

      event.preventDefault();
      navItemClicked = true;
      setActiveLink(link);

      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ behavior: "smooth" });
      history.pushState(null, "", link.hash);

      setTimeout(() => {
        navItemClicked = false;
      }, 1000);
    });
  });
}

document
  .querySelectorAll(".p-in-page-navigation")
  .forEach(initInPageNavigation);
