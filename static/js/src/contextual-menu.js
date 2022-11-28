function toggleMenu(element, show) {
  const dropdownControl = element.getAttribute("aria-controls");
  const dropdown = document.getElementById(dropdownControl);

  element.setAttribute("aria-expanded", show);
  dropdown.setAttribute("aria-hidden", !show);
}

function attachClickEvent(toggle) {
  toggle.addEventListener("click", (e) => {
    const menuAlreadyOpen = toggle.getAttribute("aria-expanded") === "true";

    e.preventDefault();
    toggleMenu(toggle, !menuAlreadyOpen);
  });
}

function attachHoverEvent(toggle) {
  const dropdown = document.getElementById(
    toggle.getAttribute("aria-controls")
  );
  let timer = null;

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
  });

  toggle.addEventListener("mouseover", () => {
    clearTimeout(timer);
    toggleMenu(toggle, true);
  });

  toggle.addEventListener("mouseleave", () => {
    toggleMenu(toggle, true);

    timer = setTimeout(() => {
      toggleMenu(toggle, false);
    }, 50);
  });

  dropdown.addEventListener("mouseover", () => {
    clearTimeout(timer);
  });

  dropdown.addEventListener("mouseleave", () => {
    timer = setTimeout(() => {
      toggleMenu(toggle, false);
    }, 50);
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
      toggleMenu(toggle, false);
    }
  });
}

function setupContextualMenuListeners(contextualMenuToggleSelector) {
  const toggles = document.querySelectorAll(contextualMenuToggleSelector);
  toggles.forEach((toggle) => {
    if (toggle.getAttribute("data-trigger") === "click") {
      attachClickEvent(toggle);
    } else if (toggle.getAttribute("data-trigger") === "hover") {
      attachHoverEvent(toggle);
    }
  });

  document.addEventListener("click", (e) => {
    toggles.forEach((toggle) => {
      const contextualMenu = document.querySelector(".p-contextual-menu");
      if (contextualMenu) {
        const clickOutside = !(
          toggle.contains(e.target) || contextualMenu.contains(e.target)
        );

        if (clickOutside) {
          toggleMenu(toggle, false);
        }
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
      toggles.forEach((toggle) => {
        toggleMenu(toggle, false);
      });
    }
  });
}

setupContextualMenuListeners(".p-contextual-menu__toggle");
