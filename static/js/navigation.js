var navDropdowns = document.querySelectorAll('.p-navigation__dropdown-link');
var dropdownWindow = document.getElementsByClassName('dropdown-window')[0];

navDropdowns.forEach(function(dropdown) {
  dropdown.addEventListener('click', function(event) {
    var clickedDropdown = this;

    if (dropdownWindow.classList.contains('u-hide--fade')) {
      dropdownWindow.classList.remove('u-hide--fade');
    }

    navDropdowns.forEach(function(dropdown) {
      var dropdownContent = document.getElementById(dropdown.id + "-content");

      if (dropdown === clickedDropdown) {
        if (dropdown.classList.contains('is-selected')) {
          dropdown.classList.remove('is-selected');
          dropdownWindow.classList.add('u-hide--fade');
          dropdownContent.classList.add('u-hide--fade');
          dropdownContent.style = "visibility: hidden;"
        } else {
          dropdownContent.style = "display: block; visibility: visible;"
          dropdown.classList.add('is-selected');
          dropdownContent.classList.remove('u-hide--fade');
        }
      } else {
        dropdown.classList.remove('is-selected');
        dropdownContent.classList.add('u-hide--fade');
        dropdownContent.style = "display: none;"
      }
    });
  });
});

var globalNav = document.getElementsByClassName('global-nav')[0];
var globalNavDropdown = document.getElementsByClassName('global-nav__dropdown-link')[0];
var globalNavContent = document.getElementsByClassName('global-nav__dropdown-content')[0];

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
