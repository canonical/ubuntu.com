var accountContainer = document.querySelector(".js-account");
var accountContainerSmall = document.querySelector(".js-account--small");
if (accountContainer && accountContainerSmall) {
  fetch("/account.json")
    .then((response) => response.json())
    .then((data) => {
      if (data.account === null) {
        accountContainerSmall.innerHTML =
          '<a href="/login" class="p-navigation__link-anchor">Sign in</a>';
        accountContainer.innerHTML =
          '<a href="/login" class="p-navigation__link-anchor" style="padding-right: 1rem;">Sign in</a>';
      } else {
        accountContainerSmall.innerHTML = `<span class="p-navigation__link-anchor">${data.account.fullname} (<a href="/logout" class="p-link--inverted">logout</a>)</span>`;
        accountContainer.innerHTML = `<div class="p-navigation__dropdown-link p-contextual-menu--right">
            <a href="" class="p-navigation__link-anchor p-contextual-menu__toggle" aria-controls="user-menu" aria-expanded="false" aria-haspopup="true">${data.account.fullname}</a>
            <span class="p-contextual-menu__dropdown" id="user-menu" aria-hidden="true">
              <span class="p-contextual-menu__group">
              <a href="/advantage" class="p-contextual-menu__link">UA subscriptions</a>
                <a href="/cube" class="p-contextual-menu__link">CUBE microcertifications</a>
              </span>
              <span class="p-contextual-menu__group">
                <a href="/logout" class="p-contextual-menu__link">Logout</a>
              </span>
            </span>
          </div>`;
      }

      function toggleMenu(element, show) {
        const container = element.closest(".p-navigation__dropdown-link");
        var target = document.getElementById(
          element.getAttribute("aria-controls")
        );

        if (show) {
          container.classList.add("is-selected");
        } else {
          container.classList.remove("is-selected");
        }

        if (target) {
          element.setAttribute("aria-expanded", show);
          target.setAttribute("aria-hidden", !show);

          if (show) {
            target.focus();
          }
        }
      }

      /**
        Attaches event listeners for the menu toggle open and close click events.
        @param {HTMLElement} menuToggle The menu container element.
      */
      function setupContextualMenu(menuToggle) {
        menuToggle.addEventListener("click", function (event) {
          event.preventDefault();

          var menuAlreadyOpen =
            menuToggle.getAttribute("aria-expanded") === "true";

          var top = menuToggle.offsetHeight;
          // for inline elements leave some space between text and menu
          if (window.getComputedStyle(menuToggle).display === "inline") {
            top += 5;
          }

          toggleMenu(menuToggle, !menuAlreadyOpen, top);
        });
      }

      /**
        Attaches event listeners for all the menu toggles in the document and
        listeners to handle close when clicking outside the menu or using ESC key.
        @param {String} contextualMenuToggleSelector The CSS selector matching menu toggle elements.
      */
      function setupAllContextualMenus(contextualMenuToggleSelector) {
        // Setup all menu toggles on the page.
        var userToggle = document.querySelector(contextualMenuToggleSelector);
        setupContextualMenu(userToggle);

        // Add handler for clicking outside the menu.
        document.addEventListener("click", function (event) {
          var contextualMenu = document.getElementById(
            userToggle.getAttribute("aria-controls")
          );
          var clickOutside = !(
            userToggle.contains(event.target) ||
            contextualMenu.contains(event.target)
          );

          if (clickOutside) {
            toggleMenu(userToggle, false);
          }
        });
      }

      setupAllContextualMenus(
        ".p-navigation__link-anchor.p-contextual-menu__toggle"
      );
    });
}
