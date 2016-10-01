var ai = [
  { url: "http://www.ubuntu.com", title:"Ubuntu" },
  { url: "https://community.ubuntu.com/", title:"Community" },
  { url: "https://askubuntu.com", title:"Ask!" },
  { url: "https://developer.ubuntu.com", title:"Developer" },
  { url: "https://design.ubuntu.com", title:"Design" },
  { url: "http://www.ubuntu.com/certification", title:"Hardware" },
  { url: "https://insights.ubuntu.com", title:"Insights" },
  { url: "https://jujucharms.com", title:"Juju" },
  { url: "http://maas.ubuntu.com", title:"MAAS" },
  { url: "http://partners.ubuntu.com", title:"Partners" },
  { url: "https://buy.ubuntu.com/", title:"Shop" }
];

var more = [
  { url: "https://help.ubuntu.com", title:"Help" },
  { url: "http://ubuntuforums.org", title:"Forum" },
  { url: "http://www.launchpad.net", title:"Launchpad" },
  { url: "http://shop.ubuntu.com", title:"Merchandise" },
  { url: "http://www.canonical.com", title:"Canonical" }
];

if(!core){ var core = {}; }

core.setupGlobalNav = function () {
  core.deployNav(core.getNav());
  core.trackClicks();
};

core.getNav = function() {
  var begin = '<nav role="navigation" id="nav-global"><div class="nav-global-wrapper"><ul class="nav-global-main">';
  var end = '</ul></div></nav>';
  var navHtmlContents = '';
  var i = 0;
  while(i < ai.length) {
    navHtmlContents += '<li><a href="' + ai[i].url + '" ' + core.getActive(ai[i].url) + '>' + ai[i].title + '</a></li>';
    i++;
  }
  i = 0;
  if(more.length > 0) {
    navHtmlContents += '<li class="more"><a href="#">More <span>&rsaquo;</span></a><ul class="nav-global-more">';
    while(i < more.length) { navHtmlContents += '<li><a href="'+ more[i].url +'">' + more[i].title + '</a></li>'; i++; }
    navHtmlContents += '</ul>';
  }
  return begin + navHtmlContents + end;
};

core.deployNav = function(navHtmlContents) {
  var containerSelector = 'body';
  var ephemeralDiv = document.createElement('div');
  ephemeralDiv.innerHTML = navHtmlContents;
  var navContents = ephemeralDiv.childNodes[0];

  if(core.globalPrepend) {
    containerSelector = core.globalPrepend;
  }

  var navContainer = document.querySelector(containerSelector);
  navContainer.insertBefore(navContents, navContainer.firstChild);

  var moreLink = document.querySelector('#nav-global .more');

  if(moreLink){
    moreLink.addEventListener(
      'click',
      function(clickEvent){
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        this.classList.toggle('open');
        return false;
      }
    );
    moreLink.querySelector('span').addEventListener(
      'click',
      function(clickEvent){
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
      }
    );
    moreLink.querySelector('ul').addEventListener(
      'click',
      function(clickEvent){
        clickEvent.stopPropagation();
      }
    );
  }

  document.body.addEventListener(
    'click',
    function(clickEvent) {
      var moreLink = document.querySelector('#nav-global .more');
      moreLink.classList.remove('open');
    }
  );
};

core.getActive = function(link) {
  var fullurl = core.getURL();
  var url = fullurl.substr(0,link.length);

  if(link == 'http://www.ubuntu.com') {
    if(fullurl.substr(0,35) == 'http://www.ubuntu.com/certification' ){
      return '';
    }
  }
  return (url == link)?'class="active"':'';
};


core.getURL = function(){
  var url = document.URL;
  url = url.replace('https://developer.ubuntu.com','https://developer.ubuntu.com');
  return url;
};

core.trackClicks = function() {
  document.querySelectorAll('#nav-global a').forEach(
    function (linkElement) {
      linkElement.addEventListener(
        'click',
        function(clickEvent) {
          clickEvent.preventDefault();

          try {
            _gaq.push(['_trackEvent', 'Global bar click', clickEvent.target.innerText, core.getURL()]);
          } catch(err){}

          setTimeout(
            function() {
              document.location.href = clickEvent.target.href;
            },
            100
          );
        }
      );
    }
  );
};

document.addEventListener(
  'DOMContentLoaded',
  function (loadEvent) {
    if(!core.globalPrepend) {
      core.setupGlobalNav();
    }
  }
);
