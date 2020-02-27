(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var triggeringHash = '#get-in-touch';
    var formContainer = document.getElementById('contact-form-container');
    var contactButtons = document.querySelectorAll('.js-invoke-modal');

    contactButtons.forEach(function (contactButton) {
      contactButton.addEventListener('click', function (e) {
        e.preventDefault();
        if (contactButton.dataset.formLocation) {
          fetchForm(contactButton.dataset, contactButton);
        } else {
          fetchForm(formContainer.dataset);
        }
        open();
      });
    });

    // recaptcha submitCallback
    const CaptchaCallback = function() {
      let recaptchas = document.querySelectorAll("div[class^=g-recaptcha]");
      recaptchas.forEach(function(field){
        if (!field.hasAttribute('data-widget-id')) {
          const recaptchaWidgetId = grecaptcha.render(field, { 'sitekey' : '6LfYBloUAAAAAINm0KzbEv6TP0boLsTEzpdrB8if' });
          field.setAttribute("data-widget-id", recaptchaWidgetId);
        }
      });
    };

    // Fetch, load and initialise form
    function fetchForm(formData, contactButton) {
      fetch(formData.formLocation)
        .then(function (response) {
          return response.text();
        })
        .then(function (text) {
          formContainer.classList.remove('u-hide');
          formContainer.innerHTML = text.replace(/%% formid %%/g, formData.formId).replace(/%% lpId %%/g, formData.lpId).replace(/%% returnURL %%/g, formData.returnUrl).replace(/%% lpurl %%/g, formData.lpUrl);
          setProductContext(contactButton);
          setUTMs();
          initialiseForm();
          CaptchaCallback();
        })
        .catch(function (error) {
          console.log('Request failed', error);
        });
    }

    // Open the contact us modal
    function open() {
      updateHash(triggeringHash);
      ga('send', 'event', 'interactive-forms', 'open', window.location.pathname);
    }

    // Removes the triggering hash
    function updateHash(hash) {
      var location = window.location;
      if (location.hash !== hash || hash === '') {
        if ("pushState" in history) {
          history.pushState('', document.title, location.pathname + location.search + hash);
        } else {
          location.hash = hash;
        }
      }
    }

    function setProductContext(contactButton) {
      // Capture current path and stringify
      // eg. /kubernetes/install -> kubernetes-install
      // fallbacks to "global"
      var product = window.location.pathname.split("/").slice(1).join("-") || "global";
      // If present, override with product parameter from button URL
      if (contactButton) {
        contactButton.search.split("&").forEach(function (param) {
          if (param.startsWith("product") || param.startsWith("?product")) {
            product = param.split("=")[1];
          }
        });
      }

      // Set product in form field
      var productContext = document.getElementById("product-context");
      if (productContext) {
        productContext.value = product;
      }
    }

    function setUTMs() {
      var params = new URLSearchParams(window.location.search);

      var utm_campaign = document.getElementById("utm_campaign");
      if (utm_campaign) {
        utm_campaign.value = params.get("utm_campaign");
      }

      var utm_source = document.getElementById("utm_source");
      if (utm_source) {
        utm_source.value = params.get("utm_source");
      }

      var utm_medium = document.getElementById("utm_medium");
      if (utm_medium) {
        utm_medium.value = params.get("utm_medium");
      }
    }

    function initialiseForm() {
      var contactIndex = 1;
      var contactModal = document.getElementById("contact-modal");
      var closeModal = document.querySelector('.p-modal__close');
      var closeModalButton = document.querySelector('.js-close');
      var modalPaginationButtons = contactModal.querySelectorAll('.pagination a');
      var paginationContent = contactModal.querySelectorAll('.js-pagination');
      var submitButton = contactModal.querySelector('.mktoButton');
      var comment = contactModal.querySelector('#Comments_from_lead__c');
      var otherContainers = document.querySelectorAll('.js-other-container');

      document.onkeydown = function (evt) {
        evt = evt || window.event;
        if (evt.keyCode == 27) {
          close();
        }
      };

      if (submitButton) {
        closeModal.addEventListener('click', function () {
          ga('send', 'event', 'interactive-forms', 'submitted', window.location.pathname);
        });
      }

      if (closeModal) {
        closeModal.addEventListener('click', function (e) {
          e.preventDefault();
          close();
        });
      }

      if (closeModalButton) {
        closeModalButton.addEventListener('click', function (e) {
          e.preventDefault();
          close();
        });
      }

      if (contactModal) {
        contactModal.addEventListener('click', function (e) {
          if (e.target.id == 'contact-modal') {
            e.preventDefault();
            close();
          }
        });
      }

      modalPaginationButtons.forEach(function (modalPaginationButton) {
        modalPaginationButton.addEventListener('click', function (e) {
          e.preventDefault();
          var button = e.target.closest('a');
          var index = contactIndex;
          if (button.classList.contains('pagination__link--previous')) {
            index = index - 1;
            setState(index);
            ga('send', 'event', 'interactive-forms', 'goto:' + index, window.location.pathname);
          } else {
            index = index + 1;
            setState(index);
            ga('send', 'event', 'interactive-forms', 'goto:' + index, window.location.pathname);
          }
        });
      });

      otherContainers.forEach(function (otherContainer) {
        var checkbox = otherContainer.querySelector('.js-other-container__checkbox');
        var input = otherContainer.querySelector('.js-other-container__input');
        checkbox.addEventListener('change', function (e) {
          if (e.target.checked) {
            input.style.opacity = 1;
            input.focus();
          } else {
            input.style.opacity = 0;
            input.value = '';
          }
        });
      });

      // Hack for now but updates the styling based on the thank you panel
      function checkThankYou() {
        if (contactIndex == 4) {
          contactModal.classList.add('thank-you');
        } else {
          contactModal.classList.remove('thank-you');
        }
      }

      // Updates the index and renders the changes
      function setState(index) {
        contactIndex = index;
        render();
      }

      // Close the modal and set the index back to the first stage
      function close() {
        setState(1);
        formContainer.classList.add('u-hide');
        formContainer.removeChild(contactModal);
        updateHash('');
        ga('send', 'event', 'interactive-forms', 'close', window.location.pathname);
      }

      // Update the content of the modal based on the current index
      function render() {
        checkThankYou();

        comment.value = createMessage();

        var currentContent = contactModal.querySelector('.js-pagination--' + contactIndex);
        paginationContent.forEach(function (content) {
          content.classList.add('u-hide');
        });
        currentContent.classList.remove('u-hide');
      }

      // Concatinate the options selected into a string
      function createMessage() {
        var message = '';

        var formFields = contactModal.querySelectorAll('.js-formfield');
        formFields.forEach(function (formField) {
          var comma = '';
          var fieldTitle = formField.querySelector('.p-heading--five');
          var inputs = formField.querySelectorAll('input, textarea');
          message += fieldTitle.innerText + '\r\n';

          inputs.forEach(function (input) {
            switch (input.type) {
              case 'radio':
                if (input.checked) {
                  message += comma + input.value;
                  comma = ', ';
                }
                break;
              case 'checkbox':
                if (input.checked) {
                  var subSectionText = '';
                  var subSection = input.closest('[class*="col-"]').querySelector('.js-sub-section');
                  if (subSection) {
                    subSectionText = subSection.innerText + ': ';
                  }

                  var label = formField.querySelector('label[for=' + input.id + ']');
                  if (label) {
                    label = subSectionText + label.innerText;
                  } else {
                    label = input.id;
                  }
                  message += comma + label;
                  comma = ', ';
                }
                break;
              case 'text':
                if (!input.classList.contains('mktoField') && input.value !== '') {
                  message += comma + input.value;
                  comma = ', ';
                }
                break;
              case 'textarea':
                if (!input.classList.contains('mktoField') && input.value !== '') {
                  message += comma + input.value;
                  comma = ', ';
                }
                break;
            }
          });
          message += '\r\n\r\n';
        });

        return message;
      }
    }


    // Opens the form when the initial hash matches the trigger
    if (window.location.hash === triggeringHash) {
      fetchForm(formContainer.dataset);
      open();
    }

    // Listens for hash changes and opens the form if it matches the trigger
    function locationHashChanged() {
      if (window.location.hash === triggeringHash) {
        fetchForm(formContainer.dataset);
        open();
      }
    }
    window.onhashchange = locationHashChanged;
  });
})();
