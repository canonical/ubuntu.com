function validateCheckbox(event, fieldsetId) {
    const checkboxes = Array.from(document.getElementById(fieldsetId).querySelectorAll("input[class='p-checkbox__input']"));
    if (event.currentTarget.checked) {
        checkboxes[0].removeAttribute("required");
    }
}

function getRadioItemValue(fieldset) {
    const selectedRadio = fieldset.querySelector("input[name='how-many-machines-do-you-have']:checked")
    return selectedRadio ? selectedRadio.value : ''
}

function getCheckboxItemsAsCSV(fieldset) {
    const checkboxes = Array.from(fieldset.querySelectorAll("input[class='p-checkbox__input']"));
    return checkboxes.filter(item => item.checked).map(item => item.value).join(", ");
}

function getCustomFields(event) {
    // If you use Ubuntu, which version(s) are you using?
    const ubuntuVersionsFieldset = document.getElementById("ubuntu-versions");
    // What kind of device are you using?
    const deviceUsedFieldset = document.getElementById("kind-of-device");
    // How many machines?
    const howManyMachinesFieldset = document.getElementById("how-many-machines");
    // How do you consume open source?
    const consumeOpenSourceFieldset = document.getElementById("how-do-you-consume-open-source");
    // Do you have specific compliance or hardening requirements?
    const hardeningRequirementsFieldset = document.getElementById("hardening-requirements");
    // Who is responsible for tracking, testing and applying CVE patches in a timely manner?
    const responsibleForTracking = document.getElementById("responsible-for-tracking");

    const data = `Tell us about your project: ${document.getElementById("about-your-project")?.value}.\n
      If you use Ubuntu, which version(s) are you using?: ${getCheckboxItemsAsCSV(ubuntuVersionsFieldset)}.\n
      What kind of device are you using?: ${getCheckboxItemsAsCSV(deviceUsedFieldset)}.\n
      How many devices?: ${getRadioItemValue(howManyMachinesFieldset)}.\n
      How do you consume open source?: ${getCheckboxItemsAsCSV(consumeOpenSourceFieldset)}.\n
      Do you have specific compliance or hardening requirements?: ${getCheckboxItemsAsCSV(hardeningRequirementsFieldset)}.\n
      Who is responsible for tracking, testing and applying CVE patches in a timely manner?: ${getCheckboxItemsAsCSV(responsibleForTracking)}.\n
      What advice are you looking for: ${document.getElementById("advice")?.value}.\n
    `

    const inputs = howManyMachinesFieldset?.querySelectorAll("input[name='how-many-machines-do-you-have']")
    inputs.forEach(function (input) {
        input.removeAttribute("name");
    })

    const textarea = document.getElementById("Comments_from_lead__c");
    textarea.value = data;
}