/**
 * CSP-safe GA event tracking.
 *
 * Replaces inline `onclick="dataLayer.push(...)"` handlers (disallowed under
 * our Content Security Policy) by binding listeners to elements that declare
 * their GA event via `data-ga-*` attributes:
 *  - data-ga-category / data-ga-action / data-ga-label (click events)
 *  - data-ga-extra-category / -action / -label (secondary click on same element)
 *  - data-ga-submit-category / -action / -label (form submit events)
 *
 * Each handler pushes a `GAEvent` to window.dataLayer for Google Tag Manager.
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function pushGAEvent(category, action, label) {
    if (!category || !action) return;
    if (typeof window.dataLayer === "undefined") {
      window.dataLayer = [];
    }
    window.dataLayer.push({
      event: "GAEvent",
      eventCategory: category,
      eventAction: action,
      eventLabel: label || undefined,
      eventValue: undefined,
    });
  }

  ready(function () {
    document.querySelectorAll("[data-ga-category]").forEach(function (el) {
      el.addEventListener("click", function () {
        pushGAEvent(
          el.getAttribute("data-ga-category"),
          el.getAttribute("data-ga-action"),
          el.getAttribute("data-ga-label"),
        );
        pushGAEvent(
          el.getAttribute("data-ga-extra-category"),
          el.getAttribute("data-ga-extra-action"),
          el.getAttribute("data-ga-extra-label"),
        );
      });
    });

    document
      .querySelectorAll("[data-ga-submit-category]")
      .forEach(function (form) {
        form.addEventListener("submit", function () {
          pushGAEvent(
            form.getAttribute("data-ga-submit-category"),
            form.getAttribute("data-ga-submit-action"),
            form.getAttribute("data-ga-submit-label"),
          );
        });
      });
  });
})();
