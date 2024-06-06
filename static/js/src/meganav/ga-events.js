var origin = window.location.href;

function addGANavEvents(target, category) {
  var t = document.querySelector(target);
  if (t) {
    [].slice.call(t.querySelectorAll("a")).forEach(function (a) {
      a.addEventListener("click", function (e) {
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

function addGAImpressionEvents(target, category) {
  var t = [].slice.call(document.querySelectorAll(target));
  if (t) {
    t.forEach(function (section) {
      if (!section.classList.contains("u-hide")) {
        var a = section.querySelector("a");
        dataLayer.push({
          event: "NonInteractiveGAEvent",
          eventCategory: "www.ubuntu.com-impression-" + category,
          eventAction: "from:" + origin + " to:" + a.href,
          eventLabel: a.text,
          eventValue: undefined,
        });
      }
    });
  }
}


function addGADownloadImpressionEvents(target, category) {
  var t = [].slice.call(document.querySelectorAll(target));
  if (t) {
    t.forEach(function (section) {
      dataLayer.push({
        event: "NonInteractiveGAEvent",
        eventCategory: "www.ubuntu.com-impression-" + category,
        eventAction: "Display option",
        eventLabel: section.innerText,
        eventValue: undefined,
      });
    });
  }
}


function addUTMToForms() {
  var params = new URLSearchParams(window.location.search);
  const utm_names = ["campaign", "source", "medium"];
  for (let i = 0; i < utm_names.length; i++) {
    var utm_fields = document.getElementsByName("utm_" + utm_names[i]);
    for (let j = 0; j < utm_fields.length; j++) {
      if (utm_fields[j]) {
        utm_fields[j].value = params.get("utm_" + utm_names[i]);
      }
    }
  }
}

export default function attachGAEvents() {
  addGANavEvents("#all-canonical-link", "www.ubuntu.com-nav-global");
  addGANavEvents("#canonical-login", "www.ubuntu.com-nav-0-login");
  addGANavEvents("#use-case", "www.ubuntu.com-nav-1-use-case");
  addGANavEvents("#support", "www.ubuntu.com-nav-1-support");
  addGANavEvents("#community", "www.ubuntu.com-nav-1-community");
  addGANavEvents("#get-ubuntu", "www.ubuntu.com-nav-1-get-ubuntu");
  addGANavEvents(".p-navigation.is-secondary", "www.ubuntu.com-nav-2");
  addGANavEvents(".p-contextual-footer", "www.ubuntu.com-footer-contextual");
  addGANavEvents(".p-footer__nav", "www.ubuntu.com-nav-footer-0");
  addGANavEvents(".p-footer--secondary", "www.ubuntu.com-nav-footer-1");
  addGANavEvents(".js-product-card", "www.ubuntu.com-product-card");
  addGAContentEvents("#main-content");
  addGAImpressionEvents(".js-product-card", "product-card");
  addGADownloadImpressionEvents(".js-download-option", "download-option");
  addUTMToForms();
}
