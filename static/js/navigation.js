var navDropdowns = document.querySelectorAll('.p-navigation__dropdown-link');
var dropdownWindowOverlay = document.querySelectorAll('.dropdown-window-overlay');
var navigationThresholdBreakpoint = 900;

function showMenu(e) {
  e.currentTarget.classList.add('is-hovered');
}

function hideMenu(e) {
  e.currentTarget.classList.remove('is-hovered');
}

function toggleMenu(e) {
  e.preventDefault();

  if (e.currentTarget.classList.contains('is-hovered')) {
    e.currentTarget.classList.remove('is-hovered');
  } else {
    e.currentTarget.classList.add('is-hovered');
  }
}

function setupDropdowns() {
  navDropdowns.forEach(function(dropdown) {
    if (window.innerWidth < navigationThresholdBreakpoint) {
      dropdown.removeEventListener('mouseenter', showMenu);
      dropdown.removeEventListener('mouseleave', hideMenu);
      dropdown.addEventListener('click', toggleMenu);
    } else {
      dropdown.removeEventListener('click', toggleMenu);
      dropdown.addEventListener('mouseenter', showMenu);
      dropdown.addEventListener('mouseleave', hideMenu);
    }
  });
}

dropdownWindowOverlay.forEach(function(overlay) {
  overlay.addEventListener('click', function(e) {
    e.stopPropagation();
    document.querySelector('.is-hovered').classList.remove('is-hovered');
  });
});

setupDropdowns();

window.addEventListener('resize', function() {
  setupDropdowns();
});

var globalNav = document.querySelector('.global-nav');
var globalNavDropdown = document.querySelector('.global-nav__link--dropdown');
var globalNavContent = document.querySelector('.global-nav__dropdown-content');

globalNavDropdown.addEventListener('click', function(event) {
  event.stopPropagation();
  globalNavDropdown.classList.toggle('is-selected');
  globalNavContent.classList.toggle('u-hide');

  if (window.innerWidth < navigationThresholdBreakpoint) {
    window.scrollTo(0, globalNav.offsetTop);
  }
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
