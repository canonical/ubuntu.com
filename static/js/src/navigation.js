var navDropdowns = [].slice.call(
  document.querySelectorAll(".p-navigation__dropdown-link")
);
var dropdownWindow = document.querySelector(".dropdown-window");
var dropdownWindowOverlay = document.querySelector(".dropdown-window-overlay");

navDropdowns.forEach(function (dropdown) {
  dropdown.addEventListener("click", function (event) {
    event.preventDefault();

    var clickedDropdown = this;

    dropdownWindow.classList.remove("slide-animation");
    dropdownWindowOverlay.classList.remove("fade-animation");

    navDropdowns.forEach(function (dropdown) {
      var dropdownContent = document.getElementById(dropdown.id + "-content");

      if (dropdown === clickedDropdown) {
        if (dropdown.classList.contains("is-selected")) {
          closeMenu(dropdown, dropdownContent);
        } else {
          dropdown.classList.add("is-selected");
          dropdownContent.classList.remove("u-hide");

          if (window.history.pushState) {
            window.history.pushState(null, null, "#" + dropdown.id);
          }
        }
      } else {
        dropdown.classList.remove("is-selected");
        dropdownContent.classList.add("u-hide");
      }
    });
  });
});

// Close the menu if browser back button is clicked
window.addEventListener("hashchange", function () {
  navDropdowns.forEach(function (dropdown) {
    const dropdownContent = document.getElementById(dropdown.id + "-content");

    if (dropdown.classList.contains("is-selected")) {
      closeMenu(dropdown, dropdownContent);
    }
  });
});

if (dropdownWindowOverlay) {
  dropdownWindowOverlay.addEventListener("click", function () {
    navDropdowns.forEach(function (dropdown) {
      var dropdownContent = document.getElementById(dropdown.id + "-content");

      if (dropdown.classList.contains("is-selected")) {
        closeMenu(dropdown, dropdownContent);
      }
    });
  });
}

function closeMenu(dropdown) {
  dropdown.classList.remove("is-selected");
  dropdownWindow.classList.add("slide-animation");
  dropdownWindowOverlay.classList.add("fade-animation");
  if (window.history.pushState) {
    window.history.pushState(null, null, window.location.href.split("#")[0]);
  }
}

if (window.location.hash) {
  var tabId = window.location.hash.split("#")[1];
  var tab = document.getElementById(tabId);

  if (tab) {
    setTimeout(function () {
      document.getElementById(tabId).click();
    }, 0);
  }
}

var origin = window.location.href;

addGANavEvents("#canonical-products", "www.ubuntu.com-nav-0-products");
addGANavEvents("#canonical-login", "www.ubuntu.com-nav-0-login");
addGANavEvents("#navigation", "www.ubuntu.com-nav-1");
addGANavEvents("#enterprise-content", "www.ubuntu.com-nav-1-enterprise");
addGANavEvents("#developer-content", "www.ubuntu.com-nav-1-developer");
addGANavEvents("#community-content", "www.ubuntu.com-nav-1-community");
addGANavEvents("#download-content", "www.ubuntu.com-nav-1-download");
addGANavEvents(".p-navigation--secondary", "www.ubuntu.com-nav-2");
addGANavEvents(".p-contextual-footer", "www.ubuntu.com-footer-contextual");
addGANavEvents(".p-footer__nav", "www.ubuntu.com-nav-footer-0");
addGANavEvents(".p-footer--secondary", "www.ubuntu.com-nav-footer-1");

function addGANavEvents(target, category) {
  var t = document.querySelector(target);
  if (t) {
    [].slice.call(t.querySelectorAll("a")).forEach(function (a) {
      a.addEventListener("click", function () {
        dataLayer.push({
          event: "GAEvent",
          eventCategory: category,
          eventAction: "from:" + origin + " to:" + a.href,
          eventLabel: a.text,
          eventValue: undefined,
        });
      });
    });
  }
}

addGAContentEvents("#main-content");

function addGAContentEvents(target) {
  var t = document.querySelector(target);
  if (t) {
    [].slice.call(t.querySelectorAll("a")).forEach(function (a) {
      let category;
      if (a.classList.contains("p-button--positive")) {
        category = "www.ubuntu.com-content-cta-0";
      } else if (a.classList.contains("p-button")) {
        category = "www.ubuntu.com-content-cta-1";
      } else {
        category = "www.ubuntu.com-content-link";
      }
      if (!a.href.startsWith("#")) {
        a.addEventListener("click", function () {
          dataLayer.push({
            event: "GAEvent",
            eventCategory: category,
            eventAction: "from:" + origin + " to:" + a.href,
            eventLabel: a.text,
            eventValue: undefined,
          });
        });
      }
    });
  }
}

addGAImpressionEvents(".js-takeover");

function addGAImpressionEvents(target) {
  var t = [].slice.call(document.querySelectorAll(target));
  if (t) {
    t.forEach(function (section) {
      if (!section.classList.contains("u-hide")) {
        var a = section.querySelector("a");
        dataLayer.push({
          event: "NonInteractiveGAEvent",
          eventCategory: "www.ubuntu.com-impression",
          eventAction: "from:" + origin + " to:" + a.href,
          eventLabel: a.text,
          eventValue: undefined,
        });
      }
    });
  }
}

addUTMToForms();

function addUTMToForms() {
  const utm_names = ["campaign", "source", "medium"];
  for (let i = 0; i < utm_names.length; i++) {
    var utm_fields = document.getElementsByName("utm_" + utm_names[i]);
    for (let j = 0; j < utm_fields.length; j++) {
      if (utm_fields[j]) {
        utm_fields[j].value = localStorage.getItem("utm_" + utm_names[i]);
      }
    }
  }
}

addUTMToLocalStorage();

function addUTMToLocalStorage() {
  if (window.localStorage && window.sessionStorage) {
    var params = new URLSearchParams(window.location.search);
    var utm_campaign = params.get("utm_campaign");
    var utm_source = params.get("utm_source");
    var utm_medium = params.get("utm_medium");
    if (utm_source != "Takeover" && utm_source != "takeover") {
      if (utm_source) {
        localStorage.setItem("utm_source", utm_source);
      }
      if (utm_campaign) {
        localStorage.setItem("utm_campaign", utm_campaign);
      }
      if (utm_medium) {
        localStorage.setItem("utm_medium", utm_medium);
      }
    }
  }
}
