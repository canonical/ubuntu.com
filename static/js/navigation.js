var navDropdowns = document.querySelectorAll('.p-navigation__dropdown-link');
var dropdownWindow = document.querySelector('.dropdown-window');
var primaryNav = document.querySelector('.p-navigation');
var globalNav = document.querySelector('.global-nav');
var globalNavDropdown = document.querySelector('.global-nav__dropdown-link');
var globalNavContent = document.querySelector('.global-nav__dropdown-content');
var wrapper = document.querySelector('.wrapper');
var footer = document.querySelector('.p-footer');
var scrollPos;

var hideFirst = function(elem, callback) {
  elem.classList.remove('u-hide');
  if (callback && typeof callback === 'function') {
    callback(elem);
  }
};

navDropdowns.forEach(function(dropdown) {
  dropdown.addEventListener('click', function(event) {
    var clickedDropdown = this;

    if (dropdownWindow.classList.contains('fade-animation')) {
      hideFirst(dropdownWindow, function() {
        scrollPos = window.scrollY;
        dropdownWindow.classList.remove('fade-animation');
        wrapper.classList.add('u-hide');
        footer.classList.add('u-hide');
        window.scrollTo(0, Math.min(scrollPos, 32));
        if (scrollPos > 32) globalNav.classList.add('u-hide');
      })
    }

    navDropdowns.forEach(function(dropdown) {
      var dropdownContent = document.getElementById(dropdown.id + "-content");

      if (dropdown === clickedDropdown) {
        if (dropdown.classList.contains('is-selected')) {
          dropdown.classList.remove('is-selected');
          dropdownWindow.classList.add('fade-animation');
          dropdownContent.classList.add('fade-animation');
          wrapper.classList.remove('u-hide');
          footer.classList.remove('u-hide');
          globalNav.classList.remove('u-hide');
          window.scrollTo(0, scrollPos);
          didScroll = false;
        } else {
          dropdown.classList.add('is-selected');
          window.scrollTo(0, 0);
          dropdownContent.classList.remove('fade-animation', 'u-hide');
        }
      } else {
        dropdown.classList.remove('is-selected');
        dropdownContent.classList.add('fade-animation', 'u-hide');
      }
    });
  });
});

globalNavDropdown.addEventListener('click', function(event) {
  event.stopPropagation();
  globalNavDropdown.classList.toggle('is-selected');
  globalNavContent.classList.toggle('u-hide');
});

document.addEventListener('click', function(event) {
  if (globalNavDropdown.classList.contains('is-selected')) {
    var clickInsideGlobal = globalNav.contains(event.target);

    if (!clickInsideGlobal) {
      globalNavDropdown.classList.remove('is-selected');
      globalNavContent.classList.add('u-hide');
    }
  }
});

var didScroll;
var lastScrollTop = 0;
var delta = 5;
var globalNavHeight = 32;
var body = document.body;
var html = document.documentElement;

window.addEventListener('scroll', function() {
  if (dropdownWindow.classList.contains('fade-animation')) {
    didScroll = true;
  }
});

setInterval(function() {
  if (didScroll) {
    hasScrolled();
    didScroll = false;
  }
}, 250);

function hasScrolled() {
  var scrollPos = window.scrollY;
  var docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
  
  if(Math.abs(lastScrollTop - scrollPos) <= delta)
    return;
  
  if (scrollPos > lastScrollTop || scrollPos < globalNavHeight) {
    primaryNav.classList.remove('nav-down');
    primaryNav.classList.add('nav-up');
  } else if (scrollPos + window.innerHeight < docHeight) {
    primaryNav.classList.remove('nav-up');
    primaryNav.classList.add('nav-down');
  }
  
  lastScrollTop = scrollPos;
}
