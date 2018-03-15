var navDropdowns = document.querySelectorAll('.p-navigation__dropdown-link');

navDropdowns.forEach(function(dropdown) {
  dropdown.addEventListener('click', function(event) {
    var clickedDropdown = this;

    navDropdowns.forEach(function(dropdown) {
      var dropdownContent = document.getElementById(dropdown.id + "-content");

      if (dropdown === clickedDropdown) {
        dropdown.classList.toggle('is-selected');
        dropdownContent.classList.toggle('u-hide');
      } else {
        dropdown.classList.remove('is-selected');
        dropdownContent.classList.add('u-hide');
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
