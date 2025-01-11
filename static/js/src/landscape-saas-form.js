function stringifyCustomFields() {
  const checkboxes = document.querySelectorAll(".js-checkbox");
  const textarea = document.getElementById("Comments_from_lead__c");
  textarea.value = "";
  let ubuntuProLocations = "";

  checkboxes.forEach(function (checkbox) {
    if (checkbox.children[0].checked) {
      const text = checkbox.children[1].innerHTML;
      ubuntuProLocations += " \r\n" + text;
    }
  });

  if (ubuntuProLocations) {
    textarea.value +=
      " \r\n" + "I have Ubuntu Pro on:" + ubuntuProLocations + " \r\n";
  }
}
