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
      var question = input.name.split('-').join(' ');
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
