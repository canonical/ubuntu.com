(function() {
  function toggleTutorialNavigation() {
    var toggleButton = document.querySelector('.l-tutorial__nav-toggle');
    var menu = document.querySelector('.l-tutorial__nav');
    toggleButton.classList.toggle('p-icon--menu');
    toggleButton.classList.toggle('p-icon--close');
    menu.classList.toggle('u-hide--small');
  }

  function setActiveLink(navigationLinks) {
    navigationLinks.forEach(function(link) {
      if (link.getAttribute('href') === window.location.hash) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  };

  function scrollToTop() {
    // Wrap in setTimeout so runs at end of event loop
    // This is so the scroll happens after the hashchange
    // which prevents the page from jumping
    window.setTimeout(function() {
      window.scrollTo(0, 0);
    });
  }

  var navigationLinks = document.querySelectorAll('.l-tutorial__nav-link');
  var toggleButton = document.querySelector('.l-tutorial__nav-toggle');

  toggleButton.addEventListener('click', toggleTutorialNavigation);

  setActiveLink(navigationLinks);

  navigationLinks.forEach(function(link) {
    link.addEventListener('click', toggleTutorialNavigation);
  });

  window.addEventListener('hashchange', function(e) {
    e.preventDefault();
    setActiveLink(navigationLinks);
    scrollToTop();
  });

  // Navigate to first tutorial step on load if no URL hash
  if (!window.location.hash) {
    var firstSectionLink = document.querySelector('.l-tutorial__nav-link');
    window.location.hash = firstSectionLink.getAttribute('href');
    scrollToTop();
  }

  var tutorialFeedbackOptions = document.querySelector('.l-tutorial__feedback-options');
  var tutorialFeedbackIcons = document.querySelectorAll('.l-tutorial__feedback-icon');
  var tutorialFeedbackResult = document.querySelector('.l-tutorial__feedback-result');

  tutorialFeedbackIcons.forEach(function(icon) {
    icon.addEventListener('click', function(e) {
      var feedbackValue = e.target.getAttribute('data-feedback-value');
      dataLayer.push({
        'event' : 'GAEvent',
        'eventCategory' : 'feedback',
        'eventAction' : feedbackValue,
        'eventLabel' : feedbackValue,
        'eventValue' : undefined
      });

      tutorialFeedbackOptions.classList.add('u-hide');
      tutorialFeedbackResult.classList.remove('u-hide');
    });
  });
})();
