/* Constants */
var AUTO_CLOSE_BUFFER = 200;
var GLOBAL_NAV_HEIGHT = 32;
var NAV_BREAKPOINT = 900;
var PRIMARY_NAV_HEIGHT = 48;
var SCROLL_LISTENER_INTERVAL = 250;
var SLIDE_ANIM_TIME = 333;

/* DOM elements */
var body = document.body;
var closeMenuLink = document.querySelector('.p-navigation__toggle--close');
var dropdownWindow = document.querySelector('.dropdown-window');
var dropdownWindowOverlay = document.querySelector('.dropdown-window-overlay');
var html = document.documentElement;
var nav = document.querySelector('.p-navigation');
var navDropdowns = document.querySelectorAll('.p-navigation__dropdown-link');

/* Global variables */
var didScroll;
var slideAnimTimeout;

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
        if (window.innerWidth > NAV_BREAKPOINT) {
          clearTimeout(slideAnimTimeout);
          var scrollPos = window.scrollY + PRIMARY_NAV_HEIGHT;
          if (window.scrollY < GLOBAL_NAV_HEIGHT) {
            scrollPos += GLOBAL_NAV_HEIGHT;
          }
          dropdownWindow.style.top = scrollPos + 'px';
        }
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
  if (window.innerWidth > NAV_BREAKPOINT) {
    dropdownWindow.style.top = window.scrollY - window.clientHeight;
    slideAnimTimeout = setTimeout(function() {
      dropdownWindow.style.top = null;
    }, SLIDE_ANIM_TIME);
  }
  if (window.history.pushState) {
    window.history.pushState(null, null, window.location.href.split('#')[0]);
  }
}

function controlNavPosition() {
  var scrollPos = window.scrollY;
  var dropdownHeight = dropdownWindow.clientHeight;
  var dropdownPos = parseInt(dropdownWindow.style.top, 10);

  if ((scrollPos + AUTO_CLOSE_BUFFER < dropdownPos) || (scrollPos > dropdownPos + dropdownHeight)) {
    closeNavigation();
  }
}

/* Set interval on how often to run scroll function */
setInterval(function() {
  if (didScroll) {
    controlNavPosition();
    didScroll = false;
  }
}, SCROLL_LISTENER_INTERVAL);

/* Apply event listeners to DOM elements */
closeMenuLink.addEventListener('click', closeNavigation);
dropdownWindowOverlay.addEventListener('click', closeNavigation);
navDropdowns.forEach(function(dropdown) {
  dropdown.addEventListener('click', toggleDropdown);
});
window.addEventListener('scroll', function() {
  didScroll = true;
});

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
