
if (!core) { var core = {}; }

// The cookie policy injection and interaction
core.cookiePolicy = function() {
  if (getCookie('_cookies_accepted') !== 'true'){
    state('open');
  }

  function state(stateChange) {
    switch(stateChange) {
      case 'open':
        var range = document.createRange();
        var cookieNode = range.createContextualFragment('<div class="p-notification p-notification--floating cookie-policy"><p class="p-notification--floating__content">We use cookies to improve your experience. By your continued use of this site you accept such use.<br /> This notice will disappear by itself. To change your settings please <a href="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy#cookies">see our policy</a>. <a href="?cp=close" class="p-notification--floating__close js-close">Close</a></p></div>');
        document.body.insertBefore(cookieNode, document.body.lastChild);
        document.querySelector('footer.p-footer').classList.add('has-cookie');
        window.setTimeout(function() {
          state('close');
        }, 10000);
        window.addEventListener('unload', function() {
          state('close');
        });
        document.querySelector('.cookie-policy .js-close').addEventListener('click', function(e) {
          e.preventDefault();
          state('close');
        });
        break;
      case 'close':
        document.querySelector('.cookie-policy').style.display = 'none';
        setCookie('_cookies_accepted', 'true', 3000);
        break;
    }
  }

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + '; ' + expires;
  }

  function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length,c.length);
      }
    }
    return '';
  }
};

// Toogles classes the active and open classes on the footer titles
core.footerMobileNav = function() {
  var footerTitlesA = document.querySelectorAll('footer li h2');
  footerTitlesA.forEach(function(node) {
    node.addEventListener('click', function(e) {
      e.target.classList.toggle('active');
    });
  });
};

// Adds click eventlistener to the copy-to-clipboard buttons. Selects the input
// and tries to copy the value to the clipboard.
core.commandLine = function () {
  document.querySelectorAll('.p-code-snippet').forEach(function(node) {
    var copyButton = node.querySelector('.p-code-snippet__action');
    var commandInput = node.querySelector('.p-code-snippet__input');
    if (copyButton && commandInput) {
      copyButton.addEventListener('click', function(e) {
        commandInput.select();
        e.preventDefault;
        try {
          var successful = document.execCommand('copy');
          dataLayer.push({
            'event': 'GAEvent',
            'eventCategory': 'Copy to clipboard',
            'eventAction': commandInput.value,
            'eventLabel': document.URL,
            'eventValue': undefined
          });
          node.classList.add('is-copied');
          setTimeout(function(e) {
            node.classList.remove('is-copied');
          }, 300);
        } catch(err) {
          node.classList.add('is-not-copied');
          console.log('Unable to copy');
        }
      });
    }

    if (commandInput) {
      commandInput.addEventListener('click', function(e) {
        this.select();
      });
    }
  });
};

// Attach listeners to switch between two pieces of content with links
core.swapContent = function(primaryContainerClass, secondaryContainerClass, showPrimaryClass, showSecondaryClass) {
  var showPrimary = document.querySelector(showPrimaryClass);
  var showSecondary = document.querySelector(showSecondaryClass);
  var primaryElement = document.querySelector(primaryContainerClass);
  var secondaryElement = document.querySelector(secondaryContainerClass);

  if (showPrimary) {
    showPrimary.addEventListener('click', function(e) {
      e.preventDefault();
      primaryElement.classList.remove('u-off-screen');
      secondaryElement.classList.add('u-off-screen');
    });
  }

  if (showSecondary) {
    showSecondary.addEventListener('click', function(e) {
      e.preventDefault();
      secondaryElement.classList.remove('u-off-screen');
      primaryElement.classList.add('u-off-screen');
    });
  }
};

core.cookiePolicy();
core.footerMobileNav();
core.commandLine();

// v1

core.siteSearch = function(){

  siteSearchToggle = document.querySelector('.search-toggle__link');
  siteSearchForm  = document.querySelector('.p-site-search__form');

  siteSearchToggle.addEventListener('click', function(e) {
    siteSearchForm.classList.toggle('u-visible');
    e.preventDefault();
  });
};

core.siteSearch();

// Contributor form toggle
core.contributorFormToggle = function(){

  individualContributorRadio = document.querySelector('#tfa_Iamsigningasanin1');
  individualForm = document.querySelector('#tfa_CanonicalIndivid');

  orgContributorRadio  = document.querySelector('#tfa_Iamsigningonbeha1');
  orgForm = document.querySelector('#tfa_CanonicalEntityC');

  if(individualContributorRadio) {
    individualContributorRadio.addEventListener('click', function(e) {
      individualForm.classList.remove('u-hidden');
      orgForm.classList.add('u-hidden');
    });
  }
  if(orgContributorRadio) {
    orgContributorRadio.addEventListener('click', function(e) {
      orgForm.classList.remove('u-hidden');
      individualForm.classList.add('u-hidden');
    });
  }
};

core.contributorFormToggle();
