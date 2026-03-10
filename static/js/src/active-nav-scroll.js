/**
 * Initializes dynamic side navigation functionality.
 *
 * This function sets up an IntersectionObserver for each section header
 * element on the page. When a section header becomes visible in the viewport,
 * the corresponding side navigation link is highlighted by adding the
 * "is-active" class. Other links have the "is-active" class removed.
 *
 * The function assumes that:
 * - Section headers have the class "section-heading".
 * - Side navigation links have the class "p-side-navigation__link".
 * - Side navigation links use href attributes that correspond to the IDs of
 *   the section headers (e.g., href="#section-id").
 *
 * IntersectionObserver options:
 * - rootMargin: "-5% 0px -87% 0px" ensures the observer triggers when the
 *   section header is within a specific portion of the viewport.
 * - threshold: 0 means the observer triggers as soon as any part of the
 *   section header is visible.
 */
export function setUpDynamicSideNav() {
  const sections = Array.prototype.slice.call(
    document.querySelectorAll(".section-heading")
  );
  const navigationLinks = Array.prototype.slice.call(
    document.querySelectorAll(".p-side-navigation__link")
  );

  sections.forEach(function (section) {
    const observer = new IntersectionObserver(
      function (entry) {
        if (entry[0].isIntersecting) {
          const sectionId = entry[0].target.id;
          console.log(sectionId);
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
        threshold: 0,
      }
    );

    observer.observe(section);
  });
}

setUpDynamicSideNav();
