core.setupAnimations = function() {
    var yOffset = 350;

    // Add the click event to display the video when clicking on the video
    // placeholder
    if (document.body.classList.contains('phone-features')) {
        var videoPanel = document.querySelector('.row--video');
        var showVideo = document.querySelector('.show-video');
        if (showVideo) {
            showVideo.addEventListener('click', function(e) {
                e.preventDefault();
                videoPanel.classList.add('show');
                document.querySelector('.the-video').innerHTML = '<div class="video-container"><iframe width="984" height="554" src="https://www.youtube.com/embed/CsDFMIphtZk?showinfo=0&vq=hd1080&rel=0&modestbranding=0&autoplay=1" frameborder="0" allowfullscreen></iframe></div>';
            });
        }
    }

    // Add the click event to display and close a video on the mobile
    // overview page
    if (document.body.classList.contains('mobile-home')) {
        var videoPanel = document.querySelector('.the-video');
        var showVideo = document.querySelector('.show-video');
        var closeVideoLink = document.querySelector('.close-vid-link');
        var closeVideo = document.querySelector('.close-video');
        var rowHero = document.querySelector('.row-hero');
        var rowContent = document.querySelector('.row--fingertips__content');

        if (showVideo) {
            showVideo.addEventListener('click', function(e) {
                e.preventDefault();
                closeVideoLink.style.display = 'block';
                videoPanel.classList.add('show');
                rowHero.style.height = '554px';
                rowContent.classList.remove('show-me');
                rowContent.classList.add('hide-me');
                videoPanel.innerHTML = '<iframe width="984" height="554" src="https://www.youtube.com/embed/-dpfHYpfEXY?showinfo=0&vq=hd1080&rel=0&modestbranding=0&autoplay=1" frameborder="0" allowfullscreen></iframe>';
            });
        }

        if (closeVideo) {
            closeVideo.addEventListener('click', function(e) {
                e.preventDefault();
                closeVideoLink.style.display = 'none';
                videoPanel.classList.remove('show');
                rowHero.style.height = '554px';
                rowContent.classList.remove('hide-me');
                rowContent.classList.add('show-me');
                videoPanel.innerHTML = '';
            });
        }
    }

    // Adds a scroll listener to the homepage which adds a class of `run`
    // to the slider-animation element.
    if (document.body.classList.contains('homepage') || document.body.classList.contains('mobile-home')) {
        var sliderAnimation = document.querySelector('.slider-animation');
        if (sliderAnimation) {
            window.addEventListener('scroll', function(e) {
                if (window.scrollY > sliderAnimation.getBoundingClientRect().top - yOffset &&
                    window.scrollY < sliderAnimation.getBoundingClientRect().top &&
                    !sliderAnimation.run) {
                    sliderAnimation.run = true;
                    sliderAnimation.classList.add('run');
                    setTimeout(function(e) {
                        sliderAnimation.classList.remove('run');
                    }, 8000);
                }
            });

            sliderAnimation.addEventListener('click', function(e) {
                sliderAnimation.classList.add('run');
                setTimeout(function(e) {
                    sliderAnimation.classList.remove('run');
                }, 8000);
            })
        }
    }
}

// Sets the left value of the slider list to appear as a slider.
// XXX Ant, look at recreating in pure CSS.
core.scopesSlideshow = function() {
    if (document.body.classList.contains('phone-developers')) {
        var slider = document.getElementById('slider');
        var sliderList = slider.querySelector('ul');
        var sliderListItems = sliderList.querySelectorAll('li');
        var index = 0;
        if (sliderListItems) {
            var slideWidth = sliderListItems[0].offsetWidth;
            var slideHeight = sliderListItems[0].offsetHeight;
            var sliderUlWidth = sliderListItems.length * slideWidth;
            slider.style.width = slideWidth + 'px';
            slider.style.height = slideHeight + 'px';
            sliderList.style.width = sliderUlWidth + 'px';

            window.onload = function() {
                setInterval(function() {
                    sliderList.style.left = (index * -slideWidth) + 'px';
                    index++;
                    if (index > sliderListItems.length - 1) {
                        index = 0;
                    }
                }, 3500);
            };
        }
    }
};

// The cookie policy injection and interaction
core.cookiePolicy = function() {
    if (getCookie('_cookies_accepted') !== 'true'){
        state('open');
    }

    function state(stateChange) {
        switch(stateChange) {
            case 'open':
                var range = document.createRange();
                var cookieNode = range.createContextualFragment('<div class="cookie-policy"><div class="wrapper"><a href="?cp=close" class="link-cta">Close</a><p>We use cookies to improve your experience. By your continued use of this site you accept such use. To change your settings please <a href="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy#cookies">see our policy</a>.</p></div></div>');
                document.body.insertBefore(cookieNode, document.body.lastChild);
                document.querySelector('footer.p-footer').classList.add('has-cookie');
                document.querySelector('.cookie-policy .link-cta').addEventListener('click', function(e) {
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
            if (c.indexOf(name) == 0) {
                return c.substring(name.length,c.length);
            }
        }
        return '';
    }
}

// Toogles classes the active and open classes on the footer titles
core.footerMobileNav = function() {
    var footerTitlesA = document.querySelectorAll('footer li h2');
    footerTitlesA.forEach(function(node) {
        node.addEventListener('click', function(e) {
            e.target.classList.toggle('active');
        });
    });
};

// Listens to resizes and triggers a redraw of the global nav
core.globalResizeListener = function() {
    window.addEventListener('resize', function(e) {
        core.redrawGlobal();
    });
    core.globalInit();
};

// If the window is less then  768px the global footer in injected into the
// footer. Otherwise it adds the global nav to the top of the body.
core.globalInit = function() {
    if (document.documentElement.clientWidth < 768) {
        core.globalPrepend = 'div.nav-global-footer';
        core.setupGlobalNav();
        var globalFooterTitle = document.createElement('h2');
        globalFooterTitle.innerHTML = 'Ubuntu websites';
        var globalWrapper = document.getElementById('nav-global');
        globalWrapper.insertBefore(globalFooterTitle, globalWrapper.lastChild);
    } else if (document.documentElement.clientWidth >= 768) {
        core.globalPrepend = 'body';
        core.setupGlobalNav();
        document.querySelector('footer.p-footer').classList.add('no-global');
    }
};

// On resize the global navigation my be moved to a new location based on
// the screen width.
core.redrawGlobal = function() {
    var globalNav = document.getElementById('nav-global');
    if (document.documentElement.clientWidth < 768 &&
        core.globalPrepend !== 'div.nav-global-footer') {
        core.globalPrepend = 'div.nav-global-footer';
        if (globalNav) {
            document.body.removeChild(globalNav);
            core.globalInit();
            core.setupGlobalNavAccordion();
        }
    } else if (document.documentElement.clientWidth >= 768 &&
        core.globalPrepend !== 'body') {
        document.querySelector('footer.p-footer').classList.add('no-global');
        core.globalPrepend = 'body';
        if (globalNav) {
            var navGlobalFooter = document.querySelector('.nav-global-footer');
            navGlobalFooter.removeChild(globalNav);
            core.setupGlobalNav();
        }
    }
};

// Add the click listener to the global nav
core.setupGlobalNavAccordion = function() {
    var globalTitle = document.querySelector('#nav-global h2');
    if (globalTitle !== null) {
        globalTitle.addEventListener('click', function(e) {
            globalTitle.classList.toggle('active');
            globalTitle.nextSibling.classList.toggle('active');
        });
    }
};

// Adds click eventlistener to the copy-to-clipboard buttons. Selects the input
// and tries to copy the value to the clipboard.
core.commandLine = function () {
  document.querySelectorAll('.command-line').forEach(function(node) {
      var copyButton = node.querySelector('.js-copy-to-clipboard');
      var commandInput = node.querySelector('.command-line__input');
      if (copyButton && commandInput) {
          copyButton.addEventListener('click', function(e) {
              e.preventDefault;
              commandInput.select();
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
}

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
}

core.setupAnimations();
core.scopesSlideshow();
core.cookiePolicy();
core.footerMobileNav();
core.globalResizeListener();
core.setupGlobalNavAccordion();
core.commandLine();

// v1

core.siteSearch = function(){

  siteSearchToggle = document.querySelector('.search-toggle__link');
  siteSearchForm  = document.querySelector('.p-site-search__form');

  siteSearchToggle.addEventListener('click', function(e) {
    siteSearchForm.classList.toggle('u-visible');
    e.preventDefault();
  });
}

core.siteSearch();
