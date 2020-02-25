(function() {
  function toggleTutorialNavigation() {
    var toggleButton = document.querySelector('.l-tutorial__nav-toggle');
    var menu = document.querySelector('.l-tutorial__nav');
    toggleButton.classList.toggle('p-icon--menu');
    toggleButton.classList.toggle('p-icon--close');
    menu.classList.toggle('u-hide--small');
  }

  function setActiveLink(navigationItems) {
    [].forEach.call(navigationItems, function(item) {
      var link = item.querySelector('.l-tutorial__nav-link');
      if (link.getAttribute('href') === window.location.hash) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });
  };

  var navigationItems = document.querySelectorAll('.l-tutorial__nav-item');
  var toggleButton = document.querySelector('.l-tutorial__nav-toggle');

  if (toggleButton) {
    toggleButton.addEventListener('click', toggleTutorialNavigation);
  }

  setActiveLink(navigationItems);

  [].forEach.call(navigationItems, function(item) {
    var link = item.querySelector('.l-tutorial__nav-link');
    link.addEventListener('click', toggleTutorialNavigation);
  });

  window.addEventListener('hashchange', function(e) {
    e.preventDefault();
    setActiveLink(navigationItems);
  });

  sectionIds = [];

  var tutorialSections = document.querySelectorAll('.l-tutorial__content section');
  [].forEach.call(tutorialSections, function(section) {
    sectionIds.push(section.id);
  });

  // Navigate to first tutorial step on load if no URL hash
  if (!window.location.hash) {
    var firstSectionLink = document.querySelector('.l-tutorial__nav-link');
    if (firstSectionLink) {
      window.location.hash = firstSectionLink.getAttribute('href');
    }
  } else {
    // Redirect #0, #1 etc. to the correct section
    match = window.location.hash.match(/^#(\d+)$/);

    if (match) {
      index = parseInt(match[1]);
      sectionId = sectionIds[index];
      window.location.hash = '#' + sectionId;
      window.location.reload();
    }
  }

  var tutorialFeedbackOptions = document.querySelector('.l-tutorial__feedback-options');
  var tutorialFeedbackIcons = document.querySelectorAll('.js-feedback-icon');
  var tutorialFeedbackResult = document.querySelector('.l-tutorial__feedback-result');

  [].forEach.call(tutorialFeedbackIcons, function(icon) {
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

(function() {
  var polls = document.querySelectorAll('.poll');

  [].forEach.call(polls, function(poll) {
    var answers = poll.querySelectorAll('[type="radio"]');
    var pollId = poll.getAttribute('data-poll-name');

    [].forEach.call(answers, function(answer) {
      answer.addEventListener('change', function(e) {
        var answerLabel = document.querySelector('label[for="' + e.target.id + '"]');
        var eventLabel = answerLabel.innerText;
        var eventAction = document.getElementById(pollId).innerText;

        dataLayer.push({
          'event' : 'GAEvent',
          'eventCategory' : 'survey',
          'eventAction' : eventAction,
          'eventLabel' : eventLabel,
          'eventValue' : undefined
        });
      });
    });
  });
})();
