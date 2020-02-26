var stickyNav = document.querySelector('.p-sticky-nav');
var stickyTabs = stickyNav.querySelectorAll('.js-sticky-tab');
var didScroll = true;

function isTabActive(tab) {
  var sectionId = tab.href.split('#')[1];
  var section = document.getElementById(sectionId);
  var rect = section.getBoundingClientRect();
  return (rect.top < stickyNav.clientHeight);
}

function render() {
  stickyTabs.forEach(function(tab) {
    if (isTabActive(tab)) {
      unsetActiveTabs();
      tab.classList.add('is-selected');
    }
  });
}

function unsetActiveTabs() {
  stickyTabs.forEach(function(tab) {
    tab.classList.remove('is-selected');
  });
}

function tick() {
  if (didScroll) {
    render();
    didScroll = false;
  }
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

window.addEventListener('scroll', function() {
  didScroll = true;
});
