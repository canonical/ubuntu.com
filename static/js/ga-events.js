var origin = window.location.pathname;

function addGANavEvents(target, category){
  var t = document.querySelector(target);
  if (t) {
    t.querySelectorAll('a').forEach(function(a) {
      var destination = a.href.replace('https://www.ubuntu.com', '').split("?")[0];
      a.addEventListener('click', function() {
        dataLayer.push({
          'event' : 'GAEvent',
          'eventCategory' : category,
          'eventAction' : "from:" + origin + " to:" + destination,
          'eventLabel' : a.text,
          'eventValue' : undefined
        });
      });
    });
  }
}

function addGAContentEvents(target){
  var t = document.querySelector(target);
  if (t) {
    t.querySelectorAll('a').forEach(function(a) {
      var destination = a.href.replace('https://www.ubuntu.com', '').split("?")[0];
      if (a.className.includes('p-button--positive')) {
        var category = 'www.ubuntu.com-content-cta-0';
      } else if (a.className.includes('p-button')) {
        var category = 'www.ubuntu.com-content-cta-1';
      } else {
        var category = 'www.ubuntu.com-content-link';
      }
      if (!destination.startsWith("#")){
        a.addEventListener('click', function() {
          dataLayer.push({
            'event' : 'GAEvent',
            'eventCategory' : category,
            'eventAction' : "from:" + origin + " to:" + destination,
            'eventLabel' : a.text,
            'eventValue' : undefined
          });
        });
      }
    });
  }
}

addGANavEvents('.global-nav__row', 'www.ubuntu.com-nav-0');
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

addGAContentEvents('#main-content')
