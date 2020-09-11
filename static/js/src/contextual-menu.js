function toggleMenu(element, show) {
  const dropdown = document.querySelector(
    element.getAttribute("aria-controls")
  );

  element.setAttribute("aria-expanded", show);
  dropdown.setAttribute("aria-hidden", !show);
}

function attachClickEvent(toggle) {
  toggle.addEventListener("click", (e) => {
    const menuAlreadyOpen = e.target.getAttribute("aria-expanded") === "true";

    e.preventDefault();
    toggleMenu(e.target, !menuAlreadyOpen);
  });
}

function attachHoverEvent(toggle) {
  const dropdown = document.querySelector(toggle.getAttribute("aria-controls"));
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

  document.onkeydown = (e) => {
    e = e || window.event;

    if (e.keyCode === 27) {
      toggleMenu(toggle, false);
    }
  };
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
      const contextualMenu = document.querySelector(
        toggle.getAttribute("aria-controls")
      );

      const clickOutside = !(
        toggle.contains(e.target) || contextualMenu.contains(e.target)
      );

      if (clickOutside) {
        toggleMenu(toggle, false);
      }
    });
  });

  document.onkeydown = (e) => {
    e = e || window.event;

    if (e.keyCode === 27) {
      toggles.forEach((toggle) => {
        toggleMenu(toggle, false);
      });
    }
  };
}

setupContextualMenuListeners(".p-contextual-menu__toggle");
