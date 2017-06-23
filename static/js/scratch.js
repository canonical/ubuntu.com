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
