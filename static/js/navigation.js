/* DOM elements */
var navDropdowns = document.querySelectorAll('.p-navigation__dropdown-link');
var dropdownWindow = document.querySelector('.dropdown-window');
var dropdownWindowOverlay = document.querySelector('.dropdown-window-overlay');
var closeMenuLink = document.querySelector('.p-navigation__toggle--close');

var toggleDropdown = function(event) {
  event.preventDefault();

  var clickedDropdown = this;

  dropdownWindow.classList.remove('slide-animation');
  dropdownWindowOverlay.classList.remove('fade-animation');

  navDropdowns.forEach(function(dropdown) {
    var dropdownContent = document.getElementById(dropdown.id + "-content");

    if (dropdown === clickedDropdown) {
      if (dropdown.classList.contains('is-selected')) {
        closeDropdown(dropdown);
      } else {
        dropdown.classList.add('is-selected');
        dropdownContent.classList.remove('u-hide');

        if (window.history.pushState) {
          window.history.pushState(null, null, '#' + dropdown.id);
        }
      }
    } else {
      dropdown.classList.remove('is-selected');
      dropdownContent.classList.add('u-hide');
    }
  });
}

var closeNavigation = function() {
  navDropdowns.forEach(function(dropdown) {
    if (dropdown.classList.contains('is-selected')) {
      closeDropdown(dropdown);
    }
  });
}

function closeDropdown(dropdown) {
  dropdown.classList.remove('is-selected');
  dropdownWindow.classList.add('slide-animation');
  dropdownWindowOverlay.classList.add('fade-animation');
  if (window.history.pushState) {
    window.history.pushState(null, null, window.location.href.split('#')[0]);
  }
}

/* Apply event listeners to DOM elements */
navDropdowns.forEach(function(dropdown) {
  dropdown.addEventListener('click', toggleDropdown);
});
closeMenuLink.addEventListener('click', closeNavigation);
dropdownWindowOverlay.addEventListener('click', closeNavigation);

/* Open primary nav on relevant dropdown when browser back button pressed */
if (window.location.hash) {
  var tabId = window.location.hash.split('#')[1];
  var tab = document.getElementById(tabId);
  var tabContent = document.getElementById(tabId + '-content');
  var navButton = document.querySelector('.p-navigation__toggle--open');

  if (tab) {
    navButton.click();
    // Hack so this fires at the end of the event loop after previous click
    setTimeout(function() {
      document.getElementById(tabId).click();
    }, 0);
  }
}
