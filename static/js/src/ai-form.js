function stringifyCustomFields() {
  const checkboxes = document.querySelectorAll(".js-checkbox");
  const radios = document.querySelectorAll("input[type=radio]");
  const textarea = document.getElementById("Comments_from_lead__c");
  const extraCommentsText = document.getElementById("mlopsRequirements").value;
  textarea.value = "";
  let offerings = "";

  checkboxes.forEach(function (checkbox) {
    if (checkbox.children[0].checked) {
      const text = checkbox.children[1].innerHTML;
      offerings += " \r\n" + text;
    } 
  });

  if (offerings) {
    textarea.value +=" \r\n" + "What are you interested in from our AI offering?" + offerings + " \r\n";
  }

  radios.forEach(radio => {
    if (radio.checked) {
        textarea.value += " \r\n" + "Do you already have any AI projects rolled out in your enterprise? " + " \r\n"  + radio.value + " \r\n";
    }
    radio.removeAttribute("name");
  })

  if (extraCommentsText) {
    textarea.value += " \r\n" + "Add details about your AI or MLOps requirements:" + " \r\n"  + extraCommentsText + " \r\n";
  }
}