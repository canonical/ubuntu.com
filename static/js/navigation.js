var navDropdowns = document.querySelectorAll('.p-navigation__dropdown-link');
var dropdownWindow = document.querySelector('.dropdown-window');
var dropdownWindowOverlay = document.querySelector('.dropdown-window-overlay');
var closeMenuLink = document.querySelector('.p-navigation__toggle--close');
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
          dropdownContent.classList.remove('fade-animation', 'u-hide');

          if (window.history.pushState) {
            window.history.pushState(null, null, '#' + dropdown.id);
          }
        }
      } else {
        dropdown.classList.remove('is-selected');
        dropdownContent.classList.add('fade-animation', 'u-hide');
      }
    });
  });
});

var globalNav = document.querySelector('.global-nav');
var globalNavDropdowns = document.querySelectorAll('.global-nav__link--dropdown');
var globalNavContent = document.querySelector('.global-nav__dropdown');
var globalNavOverlay = document.querySelector('.global-nav__dropdown-overlay');
var globalNavDropdownMenus = document.querySelectorAll('.global-nav__dropdown-content');

globalNavDropdowns.forEach(function(dropdown) {
  dropdown.addEventListener('click', function(event) {
    event.preventDefault();

    var currentLink = this;

    var targetMenuLink = dropdown.querySelector('.global-nav__link-anchor');
    var targetMenuId = targetMenuLink.getAttribute('href');
    var targetMenu = document.querySelector(targetMenuId);
    var isMobile = window.innerWidth < navigationThresholdBreakpoint;

    function scrollGlobalNavToTop() {
      window.scrollTo(0, globalNav.offsetTop);
    }

    if (globalNavContent.classList.contains('show-global-nav-content')) {
      if (dropdown.classList.contains('is-selected')) {
        dropdown.classList.remove('is-selected');
        globalNavContent.classList.remove('show-global-nav-content');
        globalNavOverlay.classList.remove('is-visible');
      } else {
        globalNavDropdowns.forEach(function(dropdown) {
          dropdown.classList.remove('is-selected');
        });
        dropdown.classList.add('is-selected');
        globalNavDropdownMenus.forEach(function(menu) {
          if (menu !== targetMenu) {
            menu.classList.add('u-hide');
          }
        });
        targetMenu.classList.remove('u-hide');
        closeMainMenu();

        if (isMobile) {
          scrollGlobalNavToTop();
        }
      }
    } else {
      currentLink.classList.add('is-selected');
      globalNavContent.classList.add('show-global-nav-content');
      globalNavOverlay.classList.add('is-visible');
      globalNavDropdownMenus.forEach(function(menu) {
        if (menu !== targetMenu) {
          menu.classList.add('u-hide');
        }
      });
      targetMenu.classList.remove('u-hide');
      closeMainMenu();

      if (isMobile) {
        scrollGlobalNavToTop();
      }
    }
  });
});

globalNavOverlay.addEventListener('click', function() {
  globalNavContent.classList.remove('show-global-nav-content');
  globalNavOverlay.classList.remove('is-visible');
  globalNavDropdowns.forEach(function(dropdown) {
    dropdown.classList.remove('is-selected');
  });
});

document.addEventListener('click', function(event) {
  globalNavDropdowns.forEach(function(globalNavDropdown) {
    if (globalNavDropdown.classList.contains('is-selected')) {
      var clickInsideGlobal = globalNav.contains(event.target);

      if (!clickInsideGlobal) {
        globalNavDropdown.classList.remove('is-selected');
        globalNavContent.classList.add('u-hide');
      }
    }
  });
});

closeMenuLink.addEventListener('click', function(event) {
  navDropdowns.forEach(function(dropdown) {
    var dropdownContent = document.getElementById(dropdown.id + "-content");

    if (dropdown.classList.contains('is-selected')) {
      closeMenu(dropdown, dropdownContent);
    }
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
  dropdownContent.classList.add('fade-animation');
  if (window.history.pushState) {
    window.history.pushState(null, null, window.location.href.split('#')[0]);
  }
}

if (window.location.hash) {
  var tabId = window.location.hash.split('#')[1];
  var tabContent = document.getElementById(tabId + '-content');

  document.getElementById(tabId).click();
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
