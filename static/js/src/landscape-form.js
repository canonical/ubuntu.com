// Stringifies non-standard form field value and adds it to "comments_from_lead_c" textarea on submission.
function contactPreference() {
  const telephoneOption = document.getElementById("telephonePreferred");
  const emailOption = document.getElementById("emailPreferred");
  const contentSummary = document.getElementById("contentSummary");
  const textarea = document.getElementById("Comments_from_lead__c");
  textarea.value = "";

  if (telephoneOption.checked) {
    const text = document.getElementById("preferredContactTelephone").outerText;
    textarea.value = "My preferred contact method is" + ": " + text + " \r\n";
  } else if (emailOption.checked) {
    const text = document.getElementById("preferredContactEmail").outerText;
    textarea.value = "My preferred contact method is" + ": " + text + " \r\n";
  }

  if (contentSummary.value) {
    textarea.value = textarea.value + "Comments" + ": " + contentSummary.value;
  }
}
