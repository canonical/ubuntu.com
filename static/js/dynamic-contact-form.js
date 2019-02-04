(function () {
  document.addEventListener('DOMContentLoaded', function() {
    var triggeringHash = '#get-in-touch';
    var contactIndex = 1;
    var contactModal = document.getElementById("contact-modal");
    var contactButtons = document.querySelectorAll('.js-invoke-modal');
    var closeModal = document.querySelector('.p-modal__close');
    var closeModalButton = document.querySelector('.js-close');
    var modalPaginationButtons = contactModal.querySelectorAll('.pagination a');
    var paginationContent = contactModal.querySelectorAll('.js-pagination');
    var submitButton = contactModal.querySelector('button.pagination__link--next');
    var inputs = contactModal.querySelectorAll('input, textarea');
    var comment = contactModal.querySelector('#Comments_from_lead__c');
    var otherContainers = document.querySelectorAll('.js-other-container');


    contactButtons.forEach(function(contactButton) {
      contactButton.addEventListener('click', function(e) {
        e.preventDefault();
        open();
      });
    });

    document.onkeydown = function(evt) {
      evt = evt || window.event;
      if (evt.keyCode == 27) {
        close();
      }
    };

    if (closeModal) {
      closeModal.addEventListener('click', function(e) {
        e.preventDefault();
        close();
      });
    }

    if (closeModalButton) {
      closeModalButton.addEventListener('click', function(e) {
        e.preventDefault();
        close();
      });
    }

    if (contactModal) {
      contactModal.addEventListener('click', function(e) {
        if (e.target.id == 'contact-modal') {
          e.preventDefault();
          close();
        }
      });
    }

    modalPaginationButtons.forEach(function(modalPaginationButton) {
      modalPaginationButton.addEventListener('click', function(e) {
        e.preventDefault();
        var button = e.target.closest('a');
        if (button.classList.contains('pagination__link--previous')) {
          setState(contactIndex - 1);
        } else {
          setState(contactIndex + 1);
        }
      });
    });

    otherContainers.forEach(function(otherContainer) {
      var checkbox = otherContainer.querySelector('.js-other-container__checkbox');
      var input = otherContainer.querySelector('.js-other-container__input');
      checkbox.addEventListener('change', function(e) {
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
      contactModal.classList.add('u-hide');
      updateHash('');
    }

    // Open the contact us modal
    function open() {
      contactModal.classList.remove('u-hide');
      updateHash(triggeringHash);
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

    // Update the content of the modal based on the current index
    function render() {
      checkThankYou();

      comment.value = createMessage();

      var currentContent = contactModal.querySelector('.js-pagination--'+contactIndex);
      paginationContent.forEach(function(content) {
        content.classList.add('u-hide');
      });
      currentContent.classList.remove('u-hide');
    }

    // Concatinate the options selected into a string
    function createMessage() {
      var message = '';
      inputs.forEach(function(input) {
        switch (input.type) {
          case 'radio':
            if (input.checked) {
              message += input.id + ': ' + input.value + ' | ';
            }
          break;
          case 'checkbox':
            if (input.checked) {
              message += input.id + ': ' + input.value + ' | ';
            }
          break;
          case 'text':
            if (!input.classList.contains('mktoField') && input.value !== '') {
              message += input.id + ': ' + input.value + ' | ';
            }
          break;
          case 'textarea':
            if (!input.classList.contains('mktoField') && input.value !== '') {
              message += input.id + ': ' + input.value + ' | ';
            }
          break;
        }
      });
      return message;
    }

    // Opens the form when the initial hash matches the trigger
    if (window.location.hash === triggeringHash) {
      open();
    }


    // Listens for hash changes and opens the form if it matches the trigger
    function locationHashChanged() {
      if (window.location.hash === triggeringHash) {
        open();
      }
    }
    window.onhashchange = locationHashChanged;
  });
})()