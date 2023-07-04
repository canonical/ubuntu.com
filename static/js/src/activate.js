// validate messages for keys
const activation_key = document.querySelector(".activate-input");
const validate_message = document.querySelector(".p-form-validation__message");

function validateKey(e) {
  const firstLetter = "The activation key starts with a K.";
  const length = "The activation key is 23 characters long.";
  const notification = document.querySelector("#notification");

  if (e.target.value.length === 0) {
    validate_message.textContent = "";
  } else if (e.target.value.charAt(0) !== "K") {
    validate_message.textContent = firstLetter;
  } else if (e.target.value.length !== 23) {
    validate_message.textContent = length;
  } else if (e.target.value.charAt(0) === "K" && e.target.value.length === 23) {
    validate_message.textContent = "";
  }
}
activation_key.addEventListener("keyup", validateKey);

// JS for modal
(function () {
  var currentDialog = null;
  var lastFocus = null;
  var ignoreFocusChanges = false;
  var focusAfterClose = null;

  // Traps the focus within the currently open modal dialog
  function trapFocus(event) {
    if (ignoreFocusChanges) return;

    if (currentDialog.contains(event.target)) {
      lastFocus = event.target;
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

  /**
    Toggles visibility of modal dialog.
    @param {HTMLElement} modal Modal dialog to show or hide.
    @param {HTMLElement} sourceEl Element that triggered toggling modal
    @param {Boolean} open If defined as `true` modal will be opened, if `false` modal will be closed, undefined toggles current visibility.
    */
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

  toggleModal(
    document.querySelector("#modal"),
    document.querySelector("[aria-controls=modal]"),
    true
  );
})();

// buying for input
const shouldCreateAccount = document.querySelector(
  "#create-purchase-account-form"
);
if (shouldCreateAccount) {
  const organisationContainer = document.querySelector(
    ".js-organisation-container"
  );
  const radioMyself = organisationContainer.querySelector(".radio-myself");
  const radioOrganisation = organisationContainer.querySelector(
    ".radio-organisation"
  );
  const organisationNameContainer = organisationContainer.querySelector(
    ".js-organisation-name-container"
  );
  const organisationNameInput = organisationNameContainer.querySelector(
    'input[name="activate-organisation-name"]'
  );
  radioOrganisation.addEventListener("change", function (e) {
    if (e.target.checked) {
      organisationNameContainer.style.display = "block";
      organisationNameContainer.focus();
      organisationNameInput.setAttribute("required", true);
    }
  });
  radioMyself.addEventListener("change", function (e) {
    if (e.target.checked) {
      organisationNameContainer.style.display = "none";
      organisationNameInput.removeAttribute("required");
    }
  });

  const createPurchaseAccountForm = document.getElementById(
    "create-purchase-account-form"
  );

  createPurchaseAccountForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const selectedOption = document.querySelector(
      'input[name="activate-buy-for"]:checked'
    );
    let accountName = document.querySelector('input[name="activate-name"]')
      .value;
    if (selectedOption.value == "organisation") {
      accountName = document.querySelector(
        'input[name="activate-organisation-name"]'
      ).value;
    }

    fetch("/account/purchase-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        marketplace: "canonical-ua",
        account_name: accountName,
      }),
    })
      .then(function (response) {
        if (response.status != 200) {
          throw new Error("Error: " + response.status);
        }
      })
      .then(function (data) {
        location.reload();
      })
      .catch(function (error) {
        console.error(error);
      });
  });
}

//submit activate key
const activateKeyForm = document.getElementById("activate-key-form");

activateKeyForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (validate_message.textContent.length > 0) {
    return;
  } else {
    const key = document.querySelector('input[name="key"]').value;
    fetch("/pro/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: key,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text);
          });
        }
        return response.json();
      })
      .then((response) => {
        window.location.replace = "/pro/dashboard";
      })
      .catch(function (err) {
        document.querySelector("#notification").style.display = "block";
        document.querySelector("#notification-message").innerHTML = JSON.parse(
          err.message
        ).errors;
      });
  }
});
