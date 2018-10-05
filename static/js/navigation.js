var navDropdowns = document.querySelectorAll('.p-navigation__dropdown-link');
var dropdownWindow = document.querySelector('.dropdown-window');
var dropdownWindowOverlay = document.querySelector('.dropdown-window-overlay');
var navigationThresholdBreakpoint = 900;

navDropdowns.forEach(function(dropdown) {
  dropdown.addEventListener('click', function(event) {
    event.preventDefault();

    var clickedDropdown = this;

    dropdownWindow.classList.remove('slide-animation');
    dropdownWindowOverlay.classList.remove('fade-animation');

    navDropdowns.forEach(function(dropdown) {
      var dropdownContent = document.getElementById(dropdown.id + "-content");

      if (dropdown === clickedDropdown) {
        if (dropdown.classList.contains('is-selected')) {
          closeMenu(dropdown, dropdownContent);
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
  });
});


dropdownWindowOverlay.addEventListener('click', function(event) {
  navDropdowns.forEach(function(dropdown) {
    var dropdownContent = document.getElementById(dropdown.id + "-content");

    if (dropdown.classList.contains('is-selected')) {
      closeMenu(dropdown, dropdownContent);
    }
  });
});

function closeMenu(dropdown, dropdownContent) {
  dropdown.classList.remove('is-selected');
  dropdownWindow.classList.add('slide-animation');
  dropdownWindowOverlay.classList.add('fade-animation');
  if (window.history.pushState) {
    window.history.pushState(null, null, window.location.href.split('#')[0]);
  }
}

if (window.location.hash) {
  var tabId = window.location.hash.split('#')[1];
  var tab = document.getElementById(tabId);
  var tabContent = document.getElementById(tabId + '-content');

  if (tab) {
    setTimeout(function() {
      document.getElementById(tabId).click();
    }, 0);
  }
}

function closeMainMenu() {
  var navigationLinks = document.querySelectorAll('.p-navigation__dropdown-link');

  navigationLinks.forEach(function(navLink) {
    navLink.classList.remove('is-selected');
  });

  if (!dropdownWindowOverlay.classList.contains('fade-animation')) {
    dropdownWindowOverlay.classList.add('fade-animation');
  }

  if (!dropdownWindow.classList.contains('slide-animation')) {
    dropdownWindow.classList.add('slide-animation');
  }
}

var origin = window.location.href;

addGANavEvents('#canonical-products', 'www.ubuntu.com-nav-0-products');
addGANavEvents('#canonical-login', 'www.ubuntu.com-nav-0-login');
addGANavEvents('#navigation', 'www.ubuntu.com-nav-1');
addGANavEvents('#enterprise-content', 'www.ubuntu.com-nav-1-enterprise');
addGANavEvents('#developer-content', 'www.ubuntu.com-nav-1-developer');
addGANavEvents('#community-content', 'www.ubuntu.com-nav-1-community');
addGANavEvents('#download-content', 'www.ubuntu.com-nav-1-download');
addGANavEvents('.p-navigation--secondary', 'www.ubuntu.com-nav-2');
addGANavEvents('.p-contextual-footer', 'www.ubuntu.com-footer-contextual');
addGANavEvents('.p-footer__nav', 'www.ubuntu.com-nav-footer-0');
addGANavEvents('.p-footer--secondary', 'www.ubuntu.com-nav-footer-1');

function addGANavEvents(target, category){
  var t = document.querySelector(target);
  if (t) {
    t.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function(){
        dataLayer.push({
          'event' : 'GAEvent',
          'eventCategory' : category,
          'eventAction' : `from:${origin} to:${a.href}`,
          'eventLabel' : a.text,
          'eventValue' : undefined
        });
      });
    });
  }
}

addGAContentEvents('#main-content')

function addGAContentEvents(target){
  var t = document.querySelector(target);
  if (t) {
    t.querySelectorAll('a').forEach(function(a) {
      if (a.className.includes('p-button--positive')) {
        var category = 'www.ubuntu.com-content-cta-0';
      } else if (a.className.includes('p-button')) {
        var category = 'www.ubuntu.com-content-cta-1';
      } else {
        var category = 'www.ubuntu.com-content-link';
      }
      if (!a.href.startsWith("#")){
        a.addEventListener('click', function(){
          dataLayer.push({
            'event' : 'GAEvent',
            'eventCategory' : category,
            'eventAction' : `from:${origin} to:${a.href}`,
            'eventLabel' : a.text,
            'eventValue' : undefined
          });
        });
      }
    });
  }
}

addGAImpressionEvents('.js-takeover')

function addGAImpressionEvents(target){
  var t = document.querySelectorAll(target);
  if (t) {
    t.forEach(function(section) {
      if (! section.className.includes('u-hide')){
        var a = section.querySelector("a");
        dataLayer.push({
          'event' : 'NonInteractiveGAEvent',
          'eventCategory' : "www.ubuntu.com-impression",
          'eventAction' : `from:${origin} to:${a.href}`,
          'eventLabel' : a.text,
          'eventValue' : undefined,
        });
      }
    });
  }
}
