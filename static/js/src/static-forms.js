(function () {
  var otherContainers = document.querySelectorAll(".js-other-container");
  function updateOtherInputVisibility(textInput, e) {
    if (e.target.checked) {
      textInput.classList.remove("u-hide");
      textInput.focus();
    } else {
      textInput.classList.add("u-hide");
      textInput.value = "";
    }
  }
  Array.prototype.forEach.call(otherContainers, function (otherContainer) {
    var otherToggle = otherContainer.querySelector(
      ".js-other-container__other-toggle"
    );
    var textInput = otherContainer.querySelector(".js-other-container__input");
    otherToggle.addEventListener(
      "change",
      updateOtherInputVisibility.bind(null, textInput)
    );
  });
})();

(function setupSubmitButton() {
  const submitButton = document.querySelector('button[type="submit"]');
  const modalForm = formContainer.querySelector("form");
  const spinnerIcon = document.createElement("i");
  spinnerIcon.className = "p-icon--spinner u-animation--spin is-light";
  modalForm.addEventListener("submit", function (e) {
    const buttonRect = submitButton.getBoundingClientRect();
    submitButton.style.width = buttonRect.width + "px";
    submitButton.style.height = buttonRect.height + "px";
    submitButton.disabled = true;
    submitButton.innerText = "";
    submitButton.appendChild(spinnerIcon);
  });
})()

function buildCommentsForLead() {
  var message = "";
  var commentsFromLead = document.querySelector("#Comments_from_lead__c");

  var formFields = document.querySelectorAll(".js-formfield");
  formFields.forEach(function (formField) {
    var comma = ",";
    var colon = ": ";
    var fieldTitle = formField.querySelector(".p-heading--3");
    var inputs = formField.querySelectorAll("input, textarea");
    if (fieldTitle) {
      message += fieldTitle.innerText + "\r\n";
    }

    inputs.forEach(function (input) {
      var question = input.name.split("-").join(" ");
      switch (input.type) {
        case "radio":
          if (input.checked) {
            message += question + colon + input.value + comma + "\r\n\r\n";
          }
          break;
        case "checkbox":
          if (input.checked) {
            message += question + colon + input.value + comma + "\r\n\r\n";
          }
          break;
        case "text":
          if (input.value !== "") {
            message += question + colon + input.value + comma + "\r\n\r\n";
          }
          break;
        case "number":
          if (input.value !== "") {
            message += question + colon + input.value + comma + "\r\n\r\n";
          }
          break;
        case "textarea":
          if (input.value !== "") {
            message += question + colon + input.value + comma + "\r\n\r\n";
          }
          break;
      }
      input.removeAttribute("name");
    });
  });

  commentsFromLead.value = message;
  return message;
}
