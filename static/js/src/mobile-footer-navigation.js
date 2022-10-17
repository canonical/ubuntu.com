function initMobileFooterAccordions(ctaSelector) {
  const ctas = document.querySelectorAll(ctaSelector);

  ctas.forEach((cta) => {
    cta.addEventListener("click", (e) => {
      const targetAccordionID = e.target.getAttribute("aria-controls");
      const targetAccordion = document.getElementById(targetAccordionID);
      const parentListItem = e.target.closest(".p-footer__title");
      const accordionIsOpen = parentListItem.classList.contains("active");

      e.preventDefault();

      if (accordionIsOpen) {
        parentListItem.classList.remove("active");
        targetAccordion.setAttribute("aria-expanded", "false");
      } else {
        parentListItem.classList.add("active");
        targetAccordion.setAttribute("aria-expanded", "true");
      }
    });
  });
}

initMobileFooterAccordions(".js-footer-accordion-cta");
