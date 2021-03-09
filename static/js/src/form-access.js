import { setCookie, getCookie, getCookieName } from "./utils/cookies";
import { reverseString } from "./utils/reverseString";

let hiddenContent = true;

// Reverse content
function reverseContent() {
  const content = document.querySelectorAll(
    ".u-obfuscate p",
    ".u-obfuscate li"
  );
  content &&
    content.forEach(function (contentItem) {
      contentItem.innerHTML = reverseString(contentItem.innerText);
    });
  hiddenContent = !hiddenContent;
}

/// @TODO assign bg submit
function fetchRestrictedContent(url, container) {
  fetch(url)
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      container.innerHTML = text;
      container.classList.add("u-reveal");
    })
    .catch(function (error) {
      console.log("Request failed", error);
    });
}

// Reveal content which is restricted on successful completion of form e.g. Downloading Whitepapers
export function revealRestrictedContent() {
  var contentContainer = document.querySelector(".l-content");
  if (contentContainer) {
    fetchRestrictedContent("robotics/_content", contentContainer); // Why so specific?
  }
  if (hiddenContent) {
    reverseContent();
  }

  // Remove the obfuscating styling
  var obfuscateItems = document.querySelectorAll(".u-obfuscate");
  obfuscateItems.forEach(function (obfuscateItem) {
    obfuscateItem.classList.remove("u-obfuscate");
  });

  // Hide the sign up form
  var formElement = document.querySelector(".signup-form");
  if (formElement) {
    formElement.classList.add("u-hide");
  }
}

// Hide restricted content by obfuscating it
function hideRestrictedContent() {
  reverseContent();
}

// After submit has happened set a cookie and reveal restricted content
export function whitepaperAfterSubmit() {
  setCookie(getCookieName(), "true", 30);
  revealRestrictedContent();
  window.location.hash = "#introduction";
}

window.onload = function () {
  // Check if form has already been submitted before showing/hiding restricted content
  if (getCookie(getCookieName())) {
    revealRestrictedContent();
  } else {
    hideRestrictedContent();
  }
};
