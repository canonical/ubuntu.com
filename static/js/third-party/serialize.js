/*jslint continue:true*/

/**
 * From: https://gist.github.com/brettz9/7147458
 * (via http://stackoverflow.com/questions/11661187/form-serialize-javascript-no-framework)
 *
 * Adapted from {@link http://www.bulgaria-web-developers.com/projects/javascript/serialize/}
 * Changes:
 *     Ensures proper URL encoding of name as well as value
 *     Preserves element order
 *     XHTML and JSLint-friendly
 *     Disallows disabled form elements and reset buttons as per HTML4 [successful controls]{@link http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2}
 *         (as used in jQuery). Note: This does not serialize <object>
 *         elements (even those without a declare attribute) or
 *         <input type="file" />, as per jQuery, though it does serialize
 *         the <button>'s (which are potential HTML4 successful controls) unlike jQuery
 * @license MIT/GPL
 */
function serialize(form) {
  "use strict";
  var i,
    j,
    len,
    jLen,
    formElement,
    q = [];
  function urlencode(str) {
    // http://kevin.vanzonneveld.net
    // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str)
      .replace(/!/g, "%21")
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/\*/g, "%2A")
      .replace(/%20/g, "+");
  }
  function addNameValue(name, value) {
    q.push(urlencode(name) + "=" + urlencode(value));
  }
  if (!form || !form.nodeName || form.nodeName.toLowerCase() !== "form") {
    throw "You must supply a form element";
  }
  for (i = 0, len = form.elements.length; i < len; i++) {
    formElement = form.elements[i];
    if (formElement.name === "" || formElement.disabled) {
      continue;
    }
    switch (formElement.nodeName.toLowerCase()) {
      case "input":
        switch (formElement.type) {
          case "checkbox":
          case "radio":
            if (formElement.checked) {
              addNameValue(formElement.name, formElement.value);
            }
            break;
          case "file":
            // addNameValue(formElement.name, formElement.value); // Will work and part of HTML4 "successful controls", but not used in jQuery
            break;
          case "reset":
            break;
          default:
            addNameValue(formElement.name, formElement.value);
            break;
        }
        break;
      case "textarea":
        addNameValue(formElement.name, formElement.value);
        break;
      case "select":
        switch (formElement.type) {
          case "select-one":
            addNameValue(formElement.name, formElement.value);
            break;
          case "select-multiple":
            for (j = 0, jLen = formElement.options.length; j < jLen; j++) {
              if (formElement.options[j].selected) {
                addNameValue(formElement.name, formElement.options[j].value);
              }
            }
            break;
        }
        break;
      case "button": // jQuery does not submit these, though it is an HTML4 successful control
        switch (formElement.type) {
          case "reset":
          case "submit":
          case "button":
            addNameValue(formElement.name, formElement.value);
            break;
        }
        break;
    }
  }
  return q.join("&");
}

export default serialize;
