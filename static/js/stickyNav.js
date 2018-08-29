var SCROLL_LISTENER_INTERVAL = 150;
var stickyNav = document.querySelector('.p-sticky-nav');
var userReportTab = document.querySelector('.js-user-report-tab');
var specsTab = document.querySelector('.js-specs-tab');
var configTab = document.querySelector('.js-config-tab');
var didScroll;

function getSectionPos(tab) {
  var sectionId = tab.href.split('#')[1];
  var section = document.getElementById(sectionId);
  var rect = section.getBoundingClientRect();
  var stickyNavHeight = stickyNav.clientHeight;
  return rect.top + window.scrollY - stickyNavHeight;
}

function controlActiveTab() {
  var scrollPos = window.scrollY;
  var userReportPos = getSectionPos(userReportTab);
  var specsPos = getSectionPos(specsTab);
  var configPos = getSectionPos(configTab);

  if (scrollPos > configPos) {
    userReportTab.classList.remove('is-selected');
    specsTab.classList.remove('is-selected');
    configTab.classList.add('is-selected');
  } else if (scrollPos > specsPos) {
    userReportTab.classList.remove('is-selected');
    specsTab.classList.add('is-selected');
    configTab.classList.remove('is-selected');
  } else if (scrollPos > userReportPos) {
    userReportTab.classList.add('is-selected');
    specsTab.classList.remove('is-selected');
    configTab.classList.remove('is-selected');
  } else {
    userReportTab.classList.remove('is-selected');
    specsTab.classList.remove('is-selected');
    configTab.classList.remove('is-selected');
  }
}

/* Set interval on how often to run scroll function */
setInterval(function() {
  if (didScroll) {
    controlActiveTab();
    didScroll = false;
  }
}, SCROLL_LISTENER_INTERVAL);

window.addEventListener('scroll', function() {
  didScroll = true;
});
