/**
 * Setup namespace
 */
if (typeof ubuntu === 'undefined') {
  var ubuntu = {};
}
if (ubuntu.hasOwnProperty('globalNav')) {
  throw TypeError("Namespace 'ubuntuGlobal' not available");
}


ubuntu.globalNav = function() {
  /**
   * Helpers & polyfills
   */
  let createFromHTML = function(html) {
    let div = document.createElement('div');
    div.innerHTML = html;
    return div.childNodes[0];
  };
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
    };
  }

  return {
    sites: [
      { url: "https://www.ubuntu.com", title:"Ubuntu" },
      { url: "https://community.ubuntu.com/", title:"Community" },
      { url: "https://askubuntu.com", title:"Ask!" },
      { url: "https://developer.ubuntu.com", title:"Developer" },
      { url: "https://design.ubuntu.com", title:"Design" },
      { url: "https://certification.ubuntu.com", title:"Hardware" },
      { url: "https://insights.ubuntu.com", title:"Insights" },
      { url: "https://jujucharms.com", title:"Juju" },
      { url: "http://maas.ubuntu.com", title:"MAAS" },
      { url: "http://partners.ubuntu.com", title:"Partners" },
      { url: "https://buy.ubuntu.com/", title:"Shop" }
    ],

    more: [
      { url: "https://help.ubuntu.com", title:"Help" },
      { url: "https://ubuntuforums.org", title:"Forum" },
      { url: "https://www.launchpad.net", title:"Launchpad" },
      { url: "https://shop.canonical.com", title:"Merchandise" },
      { url: "http://www.canonical.com", title:"Canonical" }
    ],

    setup: function () {
      let globalNav = this.createNav();

      this.addNav(globalNav);
      this.trackClicks(globalNav);

      return globalNav;
    },

    createItem: function (site) {
      let siteItem = document.createElement('li');
      let siteLink = document.createElement('a');

      siteLink.href = site.url;
      siteLink.innerText = site.title;

      if (document.URL.startsWith(site.url)) {
        siteLink.className = 'active';
      }

      siteItem.appendChild(siteLink);
      return siteItem;
    },

    createNav: function() {
      let wrapper = createFromHTML(
        '<nav role="navigation" id="nav-global">' +
        '  <div class="nav-global-wrapper">' +
        '    <ul class="nav-global-main">' +
        '      ' +
        '    </ul>' +
        '  </div>' +
        '</nav>'
      );

      let navList = wrapper.querySelector('ul');

      // Add all top sites
      this.sites.forEach(
        function(obj) {
          return function (site) {
            navList.appendChild(obj.createItem(site));
          };
        }(this)
      );

      // Add "more" sites
      if (this.more.length > 0) {
        let moreItem = createFromHTML(
          '<li class="more">' +
          '  <a href="#">' +
          '    More <span>&rsaquo;</span>' +
          '  </a>' +
          '  <ul class="nav-global-more"></ul>' +
          '</li>'
        );
        let moreList = moreItem.querySelector('ul');

        this.more.forEach(
          function (obj) {
            return function(moreSite) {
              moreList.appendChild(obj.createItem(moreSite));
            };
          }(this)
        );

        navList.appendChild(moreItem);
      }

      return wrapper;
    },

    addNav: function(globalNav) {
      document.body.insertBefore(
        globalNav,
        document.body.firstElementChild
      );

      let moreList = globalNav.querySelector('.more');
      let moreToggle = globalNav.querySelector('.more>a');

      if (moreList){
        /* Open and close the menu on click of heading */
        moreToggle.addEventListener(
          'click',
          function(moreList) {
            return function(clickEvent) {
              moreList.classList.toggle('open');
            };
          }(moreList)
        );
        /* Close the menu on click elsewhere */
        document.addEventListener(
          'click',
          function (moreList) {
            return function(clickEvent) {
              if (
                ! (
                  moreList.contains(clickEvent.target) ||
                  moreList == clickEvent.target)
              ) {
                moreList.classList.remove('open');
              }
            };
          }(moreList)
        );
      }
    },
    trackClicks: function(navGlobal) {
      navGlobal.querySelector('a').addEventListener(
        'click',
        function(clickEvent) {
          clickEvent.preventDefault();

          try {
            _gaq.push(
              ['_trackEvent', 'Global bar click', clickEvent.target.get('text'), core.getURL()]
            );
          } catch(err) {}

          setTimeout(
            function() {
              document.location.href = clickEvent.target.get('href');
            },
            100
          );
        }
      );
    }
  };
}();
