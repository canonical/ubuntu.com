/**
    Sets up modals and makes them accessible.
    @param {String} modalId Id for target modal
    @param {String} ariaControls Aria controls of triggering element
    @param {Boolean} open If defined as `true` modal will be opened, if `false` modal will be closed, undefined toggles current visibility.
  */
function initModals(modalId, ariaControls, open) {
  var currentDialog = null;
  var lastFocus = null;
  var ignoreFocusChanges = false;
  var focusAfterClose = null;

  // Traps the focus within the currently open modal dialog
  function trapFocus(e) {
    if (ignoreFocusChanges) return;

    if (currentDialog.contains(e.target)) {
      lastFocus = e.target;
    } else {
      focusFirstDescendant(currentDialog);
      if (lastFocus == document.activeElement) {
        focusLastDescendant(currentDialog);
      }
      lastFocus = document.activeElement;
    }
  }

  // Attempts to focus given element
  function attemptFocus(child) {
    if (child.focus) {
      ignoreFocusChanges = true;
      child.focus();
      ignoreFocusChanges = false;
      return document.activeElement === child;
    }

    return false;
  }

  // Focuses first child element
  function focusFirstDescendant(element) {
    for (var i = 0; i < element.childNodes.length; i++) {
      var child = element.childNodes[i];
      if (attemptFocus(child) || focusFirstDescendant(child)) {
        return true;
      }
    }
    return false;
  }

  // Focuses last child element
  function focusLastDescendant(element) {
    for (var i = element.childNodes.length - 1; i >= 0; i--) {
      var child = element.childNodes[i];
      if (attemptFocus(child) || focusLastDescendant(child)) {
        return true;
      }
    }
    return false;
  }

  function toggleModal(modal, sourceEl, open) {
    if (modal && modal.classList.contains("p-modal")) {
      if (typeof open === "undefined") {
        open = modal.style.display === "none";
      }

      if (open) {
        currentDialog = modal;
        modal.style.display = "flex";
        focusFirstDescendant(modal);
        focusAfterClose = sourceEl;
        document.addEventListener("focus", trapFocus, true);
      } else {
        modal.style.display = "none";
        if (focusAfterClose && focusAfterClose.focus) {
          focusAfterClose.focus();
        }
        document.removeEventListener("focus", trapFocus, true);
        currentDialog = null;
      }
    }
  }

  // Find and hide all modals on the page
  function closeModals() {
    var modals = [].slice.apply(document.querySelectorAll(".p-modal"));
    modals.forEach(function (modal) {
      toggleModal(modal, false, false);
    });
  }

  // Add click handler for clicks on elements with aria-controls
  document.addEventListener("click", function (event) {
    var targetControls = event.target.getAttribute("aria-controls");
    if (targetControls) {
      toggleModal(document.getElementById(targetControls), event.target);
    }
  });

  // Add handler to close modal when clicking 'close' or outside the modal
  document.addEventListener("click", function (e) {
    if (!e.target.closest(ariaControls)) {
      if (
        e.target.matches(".p-modal__close") ||
        !e.target.closest(".p-modal__dialog")
      ) {
        closeModals();
      }
    }
  });

  // Add handler for closing modals using ESC key.
  document.addEventListener("keydown", function (e) {
    e = e || window.event;
    if (e.code === "Escape") {
      closeModals();
    } else if (e.keyCode === 27) {
      closeModals();
    }
  });

  // init the dialog that is initially closed
  toggleModal(
    document.querySelector(modalId),
    document.querySelector(ariaControls),
    open
  );
}
