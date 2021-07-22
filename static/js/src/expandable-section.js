function expandCollapseSection() {
  const expandableSections = document.querySelectorAll(
    ".p-expandable-section__group"
  );
  expandableSections.forEach((expandableSection) => {
    const expandableSectionTitle = expandableSection.querySelector(
      ".p-expandable-section__tab"
    );
    const expandableSectionPanel = expandableSection.querySelector(
      ".p-expandable-section__panel"
    );
    expandableSectionTitle.addEventListener("click", () => {
      const ariaHiddenValue = expandableSectionPanel.getAttribute(
        "aria-hidden"
      );
      if (ariaHiddenValue === "false") {
        expandableSectionPanel.setAttribute("aria-hidden", "true");
        expandableSectionTitle.setAttribute("aria-expanded", "false");
      } else {
        expandableSectionPanel.setAttribute("aria-hidden", "false");
        expandableSectionTitle.setAttribute("aria-expanded", "true");
      }
    });
  });
}

expandCollapseSection();
