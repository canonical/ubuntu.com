'use strict';

/**
 * Setup namespace
 */
if (typeof ubuntu === 'undefined') {
  var ubuntu = {};
}

if (ubuntu.hasOwnProperty('globalNav')) {
  throw TypeError("Namespace 'ubuntu' not available");
}

ubuntu.globalNav = function () {
  // Helpers & polyfills
  var createFromHTML = function createFromHTML(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.childNodes[0];
  };

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
    };
  }

  return {
    sites: [{ url: "http://www.ubuntu.com", title: "Ubuntu" }, { url: "https://community.ubuntu.com/", title: "Community" }, { url: "https://askubuntu.com", title: "Ask!" }, { url: "https://developer.ubuntu.com", title: "Developer" }, { url: "https://design.ubuntu.com", title: "Design" }, { url: "https://certification.ubuntu.com", title: "Hardware" }, { url: "https://blog.ubuntu.com", title: "Blog" }, { url: "https://jujucharms.com", title: "Juju" }, { url: "http://maas.ubuntu.com", title: "MAAS" }, { url: "http://partners.ubuntu.com", title: "Partners" }, { url: "https://buy.ubuntu.com/", title: "Shop" }],

    more: [{ url: "https://help.ubuntu.com", title: "Help" }, { url: "https://ubuntuforums.org", title: "Forum" }, { url: "https://www.launchpad.net", title: "Launchpad" }, { url: "https://shop.canonical.com", title: "Merchandise" }, { url: "http://www.canonical.com", title: "Canonical" }, { url: "https://conjure-up.io", title: "conjure-up" }],

    setup: function setup() {
      var globalNav = this.createNav();

      this.addNav(globalNav);
      this.trackClicks(globalNav);

      return globalNav;
    },

    createItem: function createItem(site) {
      var last = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var siteItem = document.createElement('li');
      var siteLink = document.createElement('a');

      siteLink.href = site.url;
      siteLink.classList.add('global-nav__link');
      siteLink.innerText = site.title;

      if (document.URL.startsWith(site.url)) {
        siteLink.classList.add('is-active');
      }

      siteItem.classList.add('global-nav__list-item');
      if (last) {
        siteItem.id = 'global-nav-menu';
      }
      siteItem.appendChild(siteLink);
      return siteItem;
    },

    createNav: function createNav() {
      var wrapper = createFromHTML('<nav class="global-nav">' + '  <div class="global-nav__wrapper">' + '    <button class="global-nav__title" aria-expanded="false" aria-controls="global-navigation">' + '      Ubuntu websites' + '    </button>' + '    <ul class="global-nav__list" id="global-navigation" aria-hidden="true">' + '      ' + '    </ul>' + '  </div>' + '</nav>');

      var navList = wrapper.querySelector('ul');

      // Add all top sites
      this.sites.forEach(function (obj) {
        return function (site) {
          navList.appendChild(obj.createItem(site));
        };
      }(this));

      // Add "more" sites
      if (this.more.length > 0) {
        var moreItem = createFromHTML('<li class="global-nav__list-item--more">' + '  <a class="global-nav__link" href="#">' + '    More <span class="global-nav__more-chevron">&rsaquo;</span>' + '  </a>' + '  <ul class="global-nav__more"></ul>' + '</li>');
        var moreList = moreItem.querySelector('ul');

        this.more.forEach(function (obj) {
          return function (moreSite, index, more) {
            if (index === more.length - 1) {
              moreList.appendChild(obj.createItem(moreSite, true));
            } else {
              moreList.appendChild(obj.createItem(moreSite));
            }
          };
        }(this));

        navList.appendChild(moreItem);
      }

      return wrapper;
    },

    addNav: function addNav(globalNav) {
      document.body.insertBefore(globalNav, document.body.firstElementChild);

      var moreList = globalNav.querySelector('.global-nav__list-item--more');
      var moreToggle = globalNav.querySelector('.global-nav__list-item--more > .global-nav__link');

      if (moreList) {
        /* Open and close the menu on click of heading */
        moreToggle.addEventListener('click', function (moreList) {
          return function (clickEvent) {
            moreList.classList.toggle('is-revealed');
          };
        }(moreList));
        /* Close the menu on click elsewhere */
        document.addEventListener('click', function (moreList) {
          return function (clickEvent) {
            if (!(moreList.contains(clickEvent.target) || moreList == clickEvent.target)) {
              moreList.classList.remove('is-revealed');
            }
          };
        }(moreList));
      }

      var smallScreenToggle = globalNav.querySelector('.global-nav__title');
      var navList = globalNav.querySelector('.global-nav__list');
      if (smallScreenToggle && navList) {
        smallScreenToggle.addEventListener('click', function (smallScreenToggle) {
          return function (clickEvent) {
            smallScreenToggle.classList.toggle('is-revealed');
            navList.classList.toggle('is-revealed');
            var expand = smallScreenToggle.getAttribute('aria-expanded') == 'true';
            smallScreenToggle.setAttribute('aria-expanded', !expand);
            navList.setAttribute('aria-hidden', expand);
            if (expand) {
              window.location.hash = 'global-nav';
            } else {
              window.location.hash = 'global-nav-menu';
            }
          };
        }(smallScreenToggle));
      }
    },
    trackClicks: function trackClicks(navGlobal) {
      navGlobal.querySelector('a').addEventListener('click', function (clickEvent) {
        clickEvent.preventDefault();

        try {
          _gaq.push(['_trackEvent', 'Global bar click', clickEvent.target.get('text')]);
        } catch (err) {}

        setTimeout(function () {
          document.location.href = clickEvent.target.getAttribute('href');
        }, 100);
      });
    }
  };
}();