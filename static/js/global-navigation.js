/* Constants */
var NAV_BREAKPOINT = 900;

/* DOM elements */
var globalNav = document.querySelector('.global-nav');
var globalNavDropdowns = document.querySelectorAll('.global-nav__link--dropdown');
var globalNavContent = document.querySelector('.global-nav__dropdown');
var globalNavOverlay = document.querySelector('.global-nav__dropdown-overlay');
var globalNavDropdownMenus = document.querySelectorAll('.global-nav__dropdown-content');
var footerTitlesA = document.querySelectorAll('.global-nav--mobile .p-footer__title');

globalNavDropdowns.forEach(function(dropdown) {
  dropdown.addEventListener('click', function(event) {
    event.preventDefault();

    var currentLink = this;

    var targetMenuLink = dropdown.querySelector('.global-nav__link-anchor');
    var targetMenuId = targetMenuLink.getAttribute('href');
    var targetMenu = document.querySelector(targetMenuId);
    var isMobile = window.innerWidth < NAV_BREAKPOINT;

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

globalNavOverlay.addEventListener('click', closeGlobalNav);

document.addEventListener('click', function(event) {
  globalNavDropdowns.forEach(function(globalNavDropdown) {
    if (globalNavDropdown.classList.contains('is-selected')) {
      var clickInsideGlobal = globalNav.contains(event.target);

      if (!clickInsideGlobal) {
        globalNavDropdown.classList.remove('is-selected');
      }
    }
  });
});

function closeGlobalNav() {
  globalNavContent.classList.remove('show-global-nav-content');
  globalNavOverlay.classList.remove('is-visible');
  globalNavDropdowns.forEach(function(dropdown) {
    dropdown.classList.remove('is-selected');
  });
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

function controlGlobalNavPosition() {
  var globalNavDropdown = document.querySelector('.global-nav__dropdown');

  if (globalNavDropdown.classList.contains('show-global-nav-content')) {
    var scrollPos = window.scrollY;
    var globalNavHeight = globalNavDropdown.clientHeight;

    if (scrollPos > globalNavHeight) {
      closeGlobalNav();
    }
  }
}

function mobileGlobalNav() {
  footerTitlesA.forEach(function(node) {
    node.addEventListener('click', function(e) {
      e.target.classList.toggle('active');
    });
  });
};

mobileGlobalNav();
