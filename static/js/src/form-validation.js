/**
 * Handler for a form submit event
 * to disable the normal submit, and instead use backgroundSubmit
 */

const backgroundSubmitHandlerClosure = function() {
  return function(submitEvent) {
    // Prevent normal submit
    submitEvent.preventDefault
      ? submitEvent.preventDefault()
      : (submitEvent.returnValue = false);

    // get form
    var marketoForm = document.getElementById(submitEvent.target.id);

    // Change the form's action location
    marketoForm.action =
      "https://app-sjg.marketo.com/index.php/leadCapture/save2";

    // Submit the form in the background
    backgroundSubmit(marketoForm);
  };
};

const backgroundSubmit = function(marketoForm, submitCallback) {
  var request = new XMLHttpRequest();
  var submitUrl = marketoForm.getAttribute("action");
  let formData = serialize(marketoForm);

  request.open("POST", submitUrl, true);

  //Send the proper header information along with the request
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  // When request has finished, call the callback function
  if (submitCallback) {
    request.addEventListener("readystatechange", function() {
      if (this.readyState == 4) {
        // Pass context and arguments on to submitCallback
        submitCallback.apply(this, arguments);
      }
    });
  }

  // recaptcha test
  var recaptchaListElement = marketoForm.getElementsByClassName(
    "g-recaptcha"
  )[0];
  var recaptchaWidgetId = recaptchaListElement.dataset.widgetId;
  var response = grecaptcha.getResponse(recaptchaWidgetId);
  var already_errored = document.getElementById("recaptcha-msg");
  if (response === "") {
    if (!already_errored) {
      recaptchaListElement.classList.add("recaptcha-is-error");
      recaptchaListElement.insertAdjacentHTML(
        "afterend",
        '<p id="recaptcha-msg" class="p-form-validation__message" role="alert"><strong>Error:</strong> You need to complete the recaptcha to submit this form. </p>'
      );
    }
    return false;
  } else {
    if (already_errored) {
      recaptchaListElement.classList.remove("recaptcha-is-error");
      var msg = document.getElementById("recaptcha-msg");
      msg.parentNode.removeChild(msg);
    }
  }

  // copy recaptcha to marketo field
  formData = formData.concat("&grecaptcharesponse=" + response);

  // Send off the POST request
  request.send(formData);

  // get the download asset if it exists
  var download_asset_url = marketoForm.querySelector(
    "input[name=download_asset_url]"
  );
  if (download_asset_url != null) {
    download_asset_url = download_asset_url.value;
  }

  // get the return url if it exists to redirect users after
  var return_url = marketoForm.querySelector("input[name=return_url]");
  if (return_url != null) {
    return_url = return_url.value;
  }

  // check if it is a dynamic modal form
  var isModal = marketoForm.classList.contains("modal-form");

  // check if it is a whitepaper
  var isWhitepaper = marketoForm.classList.contains("whitepaper-form");

  // check if there is a thank you message to post
  var thankYouMessage = marketoForm.querySelector(
    "input[name=thankyoumessage]"
  );
  if (thankYouMessage != null) {
    thankYouMessage = thankYouMessage.value;
  }

  // reset form and captcha
  if (!document.querySelector(".js-feedback-notification")) {
    marketoForm.reset();
  }
  grecaptcha.reset();

  // deal with the post submit actions
  afterSubmit(
    download_asset_url,
    return_url,
    isModal,
    thankYouMessage,
    marketoForm,
    isWhitepaper
  );

  return true;
};

/**
 * After submit has happened
 * start download and send the user to the instructions page
 */

const afterSubmit = function(
  download_asset_url,
  return_url,
  isModal,
  thankYouMessage,
  marketoForm,
  isWhitepaper
) {
  // Now start the download
  if (download_asset_url) {
    var downloadFrame = document.createElement("iframe");
    downloadFrame.setAttribute("src", download_asset_url);
    downloadFrame.style.width = 0 + "px";
    downloadFrame.style.height = 0 + "px";
    document.body.insertBefore(downloadFrame, document.body.childNodes[0]);
  }

  // And redirect to the instructions page
  if (return_url) {
    window.setTimeout(function() {
      window.location.href = return_url;
    }, 1000);
  }

  // dynamic thank you HACK
  if (isModal) {
    document
      .getElementsByClassName("js-pagination--3")[0]
      .classList.add("u-hide");
    document
      .getElementsByClassName("js-pagination--4")[0]
      .classList.remove("u-hide");
  }

  // add a thank-you notification to the page
  // if someone submitted a form without a thank you action
  if (return_url === null && isModal === false && isWhitepaper === false) {
    if (thankYouMessage === null) {
      thankYouMessage =
        "Thank you<br />A member of our team will be in touch within one working day";
    }
    var feedbackArea = document.querySelector(".js-feedback-notification");
    if (feedbackArea) {
      feedbackArea.innerHTML =
        '<div class="p-notification--positive"><p class="p-notification__response">' +
        thankYouMessage +
        "</p></div>";
      var inputs = marketoForm.querySelectorAll("input, button");
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = "disabled";
      }
      var recaptcha = marketoForm.querySelector(".g-recaptcha");
      if (recaptcha) {
        recaptcha.classList.add("u-hide");
      }
      marketoForm.style.opacity = ".5";
    } else {
      document
        .getElementById("main-content")
        .insertAdjacentHTML(
          "afterbegin",
          '<div class="p-strip is-shallow u-no-padding--bottom"><div class="row"><div class="p-notification--positive"><p class="p-notification__response">' +
            thankYouMessage +
            "</p></div></div></div>"
        );
      window.scrollTo(0, 0);
    }
  }

  if (isWhitepaper) {
    whitepaperAfterSubmit();
  }
};

// attach handler to all forms
let marketoForm = document.querySelectorAll("form[id^=mktoForm]");
marketoForm.forEach(function(form) {
  form.addEventListener("submit", backgroundSubmitHandlerClosure());
});

// After submit has happened set a cookie and reveal the content
function whitepaperAfterSubmit() {
  setCookie(getCookieName(), "true", 30);
  revealContent();
  window.location.hash = "#introduction";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Returns a unique cookie name for this URL path
function getCookieName() {
  var encodedPath = window.location.pathname.split("/").join("-");
  return "formFilled" + encodedPath;
}

function revealContent() {
  var contentContainer = document.querySelector(".l-content");
  if (contentContainer) {
    fetchContent("robotics/_content", contentContainer);
  }

  if (hiddenContent) {
    var content = document.querySelectorAll(
      ".u-obfuscate p",
      ".u-obfuscate li"
    );
    content.forEach(function(contentItem) {
      contentItem.innerHTML = reverseContent(contentItem.innerText);
    });
    hiddenContent = false;
  }

  // Remove the obfuscating styling
  var obfuscateItems = document.querySelectorAll(".u-obfuscate");
  obfuscateItems.forEach(function(obfuscateItem) {
    obfuscateItem.classList.remove("u-obfuscate");
  });

  // Hide the sign up form
  var formElement = document.querySelector(".signup-form");
  if (formElement) {
    formElement.classList.add("u-hide");
  }
}

function fetchContent(url, container) {
  fetch(url)
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      container.innerHTML = text;
      container.classList.add("u-reveal");
    })
    .catch(function(error) {
      console.log("Request failed", error);
    });
}

let hiddenContent = true;

function reverseContent(contentString) {
  var splitContent = contentString.split("");
  var reverseArray = splitContent.reverse();
  var reversedString = reverseArray.join("");
  return reversedString;
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

function hideContent() {
  hiddenContent = true;
  // Baffle to obfucast the text
  var content = document.querySelectorAll(".u-obfuscate p", ".u-obfuscate li");
  content.forEach(function(contentItem) {
    contentItem.innerText = reverseContent(contentItem.innerHTML);
  });
}

window.onload = function() {
  if (getCookie(getCookieName())) {
    revealContent();
  } else {
    hideContent();
  }
};
