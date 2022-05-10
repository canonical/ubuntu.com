// Stringifies non-standard form field value and adds it to "comments_from_lead_c" textarea on submission.
function contactPrefrence() {
  const telephoneOption = document.getElementById("telephonePreferred");
  const emailOption = document.getElementById("emailPreferred");
  const textarea = document.getElementById("Comments_from_lead__c");

  if (telephoneOption.checked) {
    const text = document.getElementById("preferredContactTelephone").outerText;
    textarea.value += text;
  } else if (emailOption.checked) {
    const text = document.getElementById("preferredContactEmail").outerText;
    textarea.value += text;
  }
}
