var navDropdowns = document.querySelectorAll('.p-navigation__dropdown-link');

navDropdowns[0].addEventListener('click', function(event) {
	var dropdownContent = document.getElementById(navDropdowns[0].id + "-content");
	navDropdowns[0].classList.toggle('is-selected');
	dropdownContent.classList.toggle('u-hide--animate1');
});

navDropdowns[1].addEventListener('click', function(event) {
	var dropdownContent = document.getElementById(navDropdowns[1].id + "-content");
	navDropdowns[1].classList.toggle('is-selected');
	dropdownContent.classList.toggle('u-hide--animate2');
});

navDropdowns[2].addEventListener('click', function(event) {
	var dropdownWindow = document.getElementsByClassName('dropdown-window')[0];
	navDropdowns[2].classList.toggle('is-selected');
	dropdownWindow.classList.toggle('is-closed');
	if (dropdownWindow.style.maxHeight) {
		dropdownWindow.style.maxHeight = null;
	} else {
		dropdownWindow.style.maxHeight = "1500px";
	}
});

navDropdowns[3].addEventListener('click', function(event) {
	var dropdownWindow = document.getElementsByClassName('dropdown-window')[1];
	var dropdownContent = document.getElementById(navDropdowns[3].id + "-content");
	navDropdowns[3].classList.toggle('is-selected');
	dropdownWindow.classList.toggle('is-closed');
	dropdownContent.classList.toggle('u-invisible');
	if (dropdownWindow.style.maxHeight) {
		dropdownWindow.style.maxHeight = null;
	} else {
		dropdownWindow.style.maxHeight = "1500px";
	}
});

var globalNavDropdown = document.getElementsByClassName('global-nav__dropdown-link')[0];
var globalNavContent = document.getElementsByClassName('global-nav__dropdown-content')[0];

globalNavDropdown.addEventListener('click', function(event) {
	globalNavDropdown.classList.toggle('is-selected');
	globalNavContent.classList.toggle('u-hide');
});