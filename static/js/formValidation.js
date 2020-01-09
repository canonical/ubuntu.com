/**
* Handler for a form submit event
* to disable the normal submit, and instead use backgroundSubmit
*/

backgroundSubmitHandlerClosure = function(submitEvent) {
  return function(submitEvent) {

    // Prevent normal submit
    submitEvent.preventDefault ? submitEvent.preventDefault() : submitEvent.returnValue = false;

    // get form
    var marketoForm = document.getElementById(submitEvent.target.id);

    // Change the form's action location
    marketoForm.action = "https://app-sjg.marketo.com/index.php/leadCapture/save2";

    // Submit the form in the background
    backgroundSubmit(marketoForm);
  }
}

backgroundSubmit = function(marketoForm, submitCallback) {
  var request = new XMLHttpRequest();
  var submitUrl = marketoForm.getAttribute('action');
  var formData = serialize(marketoForm);

  request.open("POST", submitUrl, true);

  //Send the proper header information along with the request
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  // When request has finished, call the callback function
  if (submitCallback) {
    request.addEventListener(
    'readystatechange',
    function() {
      if (this.readyState == 4) {
        // Pass context and arguments on to submitCallback
        submitCallback.apply(this, arguments);
      }
    });
  }

  // recaptcha test
  var recaptchaListElement = marketoForm.getElementsByClassName('g-recaptcha')[0];
  var recaptchaWidgetId = recaptchaListElement.dataset.widgetId;
  var response = grecaptcha.getResponse(recaptchaWidgetId);
  var already_errored = document.getElementById('recaptcha-msg');
  if (response === '') {
    if (!already_errored) {
      recaptchaListElement.classList.add("recaptcha-is-error");
      recaptchaListElement.insertAdjacentHTML('afterend', '<p id="recaptcha-msg" class="p-form-validation__message" role="alert"><strong>Error:</strong> You need to complete the recaptcha to submit this form. </p>');
    }
    return false;
  } else {
    if (already_errored) {
      recaptchaListElement.classList.remove("recaptcha-is-error");
      var msg = document.getElementById('recaptcha-msg');
      msg.parentNode.removeChild(msg);
    }
  }

  // copy recaptcha to marketo field
  var formData = formData.concat("&grecaptcharesponse=" + response);

  // Send off the POST request
  request.send(formData);

  // get the download asset if it exists
  var download_asset_url = marketoForm.querySelector('input[name=download_asset_url]');
  if (download_asset_url != null) {
    download_asset_url = download_asset_url.value;
  }

  // get the return url if it exists to redirect users after
  var return_url = marketoForm.querySelector('input[name=return_url]');
  if (return_url != null) {
    return_url = return_url.value;
  }

  // check if it is a dynamic modal form
  var isModal = marketoForm.classList.contains("modal-form");

  // check if it is a whitepaper
  var isWhitepaper = marketoForm.classList.contains("whitepaper-form");

  // check if there is a thank you message to post
  var thankYouMessage = marketoForm.querySelector('input[name=thankyoumessage]');
  if (thankYouMessage != null) {
    thankYouMessage = thankYouMessage.value;
  }
  formid = this.id;

  // reset form and captcha
  if (!document.querySelector('.js-feedback-notification')) {
    marketoForm.reset();
  }
  grecaptcha.reset();

  // deal with the post submit actions
  afterSubmit(download_asset_url, return_url, isModal, thankYouMessage, marketoForm, isWhitepaper);

  return true;
}

/**
* After submit has happened
* start download and send the user to the instructions page
*/

afterSubmit = function(download_asset_url, return_url, isModal, thankYouMessage, marketoForm, isWhitepaper) {

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
    document.getElementsByClassName('js-pagination--3')[0].classList.add("u-hide");
    document.getElementsByClassName('js-pagination--4')[0].classList.remove("u-hide");
  }

  // add a thank-you notification to the page
  // if someone submitted a form without a thank you action
  if (return_url === null && isModal === false && isWhitepaper === false) {
    if (thankYouMessage === null) {
      thankYouMessage = 'Thank you<br />A member of our team will be in touch within one working day';
    }
    var feedbackArea = document.querySelector('.js-feedback-notification');
    if (feedbackArea) {
      feedbackArea.innerHTML = '<div class="p-notification--positive"><p class="p-notification__response">' + thankYouMessage + '</p></div>';
      var inputs = marketoForm.querySelectorAll('input, button');
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = "disabled";
      }
      var recaptcha = marketoForm.querySelector('.g-recaptcha');
      if (recaptcha) {
        recaptcha.classList.add('u-hide');
      }
      marketoForm.style.opacity = ".5";
    } else {
      document.getElementById('main-content').insertAdjacentHTML('afterbegin', '<div class="p-strip is-shallow u-no-padding--bottom"><div class="row"><div class="p-notification--positive"><p class="p-notification__response">' + thankYouMessage + '</p></div></div></div>');
      window.scrollTo(0,0);
    }
  }

  if (isWhitepaper) {
    whitepaperAfterSubmit();
  }
}

// recaptcha submitCallback
CaptchaCallback = function() {
  let recaptchas = document.querySelectorAll("div[class^=g-recaptcha]");
  recaptchas.forEach(function(field){
    recaptchaWidgetId = grecaptcha.render(field, {'sitekey' : '6LfYBloUAAAAAINm0KzbEv6TP0boLsTEzpdrB8if'});
    field.setAttribute("data-widget-id", recaptchaWidgetId);
  });
}

// attach handler to all forms
let marketoForm = document.querySelectorAll("form[id^=mktoForm]");
marketoForm.forEach(function(form) {
  form.addEventListener('submit', backgroundSubmitHandlerClosure())
});