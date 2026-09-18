/**
 * Live preview handshake for CMS pages shown inside the Strapi admin.
 *
 * Strapi's preview panel speaks a small postMessage protocol:
 *
 *   page  → admin   previewReady   the page is loaded and listening
 *   admin → page    strapiScript   a script enabling visual editing
 *   admin → page    strapiUpdate   the document changed; re-render
 *
 * The review screen adds three of its own, so a reviewer can point at
 * the part of the page they mean:
 *
 *   admin → page    cmsReviewMode      sections become clickable
 *   admin → page    cmsChanged         mark these as changed
 *   admin → page    cmsHighlight       outline this section, or none
 *   page  → admin   cmsSectionPicked   the reviewer clicked this one
 *
 * Only runs inside an iframe, so a normal page visit costs nothing.
 */
(function () {
  if (window.parent === window) {
    return;
  }

  var PREVIEW_READY = "previewReady";
  var STRAPI_SCRIPT = "strapiScript";
  var STRAPI_UPDATE = "strapiUpdate";
  var CMS_HIGHLIGHT = "cmsHighlight";
  var CMS_REVIEW_MODE = "cmsReviewMode";
  var CMS_SECTION_PICKED = "cmsSectionPicked";
  var CMS_CHANGED = "cmsChanged";

  var HIGHLIGHT_STYLES =
    "[data-cms-highlight] {" +
    "outline: 3px solid #e95420;" +
    "outline-offset: -3px;" +
    "background: rgba(233, 84, 32, 0.06);" +
    "}" +
    // Only while the review screen is open: makes it plain that a
    // section is a thing you can pick, rather than a page you can use.
    "[data-cms-reviewing] [data-cms-section] {" +
    "cursor: pointer;" +
    "}" +
    "[data-cms-reviewing] [data-cms-section]:hover {" +
    "outline: 2px dashed rgba(233, 84, 32, 0.7);" +
    "outline-offset: -2px;" +
    "}" +
    // A section that differs from what is live, flagged in the page so
    // a reviewer can see where to look without reading a list first.
    "[data-cms-changed] {" +
    "box-shadow: inset 4px 0 0 0 #0f95a1;" +
    "position: relative;" +
    "}" +
    "[data-cms-changed]::before {" +
    'content: "Changed";' +
    "background: #0f95a1;" +
    "color: #fff;" +
    "font: 600 11px/1 Ubuntu, sans-serif;" +
    "left: 0;" +
    "letter-spacing: 0.05em;" +
    "padding: 4px 8px;" +
    "position: absolute;" +
    "text-transform: uppercase;" +
    "top: 0;" +
    "z-index: 2;" +
    "}";

  function announceReady() {
    window.parent.postMessage({ type: PREVIEW_READY }, "*");
  }

  var styled = false;

  /** The review styles, added once, the first time anything needs them. */
  function ensureStyles() {
    if (styled) {
      return;
    }

    var style = document.createElement("style");
    style.textContent = HIGHLIGHT_STYLES;
    document.head.appendChild(style);
    styled = true;
  }

  /**
   * Outline one section, or clear the outline when index is not a
   * number. Sections are marked up by templates/_cms/page.html, which
   * only emits the markers for a framed preview.
   */
  function highlight(index, scroll) {
    ensureStyles();

    var previous = document.querySelectorAll("[data-cms-highlight]");

    for (var i = 0; i < previous.length; i++) {
      previous[i].removeAttribute("data-cms-highlight");
    }

    if (typeof index !== "number") {
      return;
    }

    var section = document.querySelector('[data-cms-section="' + index + '"]');

    if (!section) {
      return;
    }

    section.setAttribute("data-cms-highlight", "true");

    if (scroll) {
      // A scroll asked for in the moments right after a load is
      // discarded — the browser resets the position itself as the page
      // settles. Nothing here waits for that: the admin only asks once
      // somebody clicks, which is long past it.
      var top =
        section.getBoundingClientRect().top +
        (window.pageYOffset || document.documentElement.scrollTop);

      window.scrollTo({
        top: Math.max(0, top - window.innerHeight / 4),
        behavior: "smooth",
      });
    }
  }

  /** Flag the sections that differ from what is live. */
  function markChanged(positions) {
    ensureStyles();

    var flagged = document.querySelectorAll("[data-cms-changed]");

    for (var i = 0; i < flagged.length; i++) {
      flagged[i].removeAttribute("data-cms-changed");
    }

    if (!positions || !positions.length) {
      return;
    }

    for (var j = 0; j < positions.length; j++) {
      var section = document.querySelector(
        '[data-cms-section="' + positions[j] + '"]'
      );

      if (section) {
        section.setAttribute("data-cms-changed", "true");
      }
    }
  }

  /** The section a click landed in, or null if it landed outside one. */
  function sectionAround(node) {
    while (node && node !== document.body) {
      if (node.getAttribute && node.hasAttribute("data-cms-section")) {
        return node;
      }

      node = node.parentNode;
    }

    return null;
  }

  /**
   * In review mode a click picks the section it landed in and tells the
   * admin, rather than doing whatever the page would normally do. The
   * listener is on the capture phase and stops the event there: without
   * that, clicking a section that happens to be mostly a link would
   * navigate the frame away from the page under review.
   */
  document.addEventListener(
    "click",
    function (event) {
      if (!document.documentElement.hasAttribute("data-cms-reviewing")) {
        return;
      }

      var section = sectionAround(event.target);

      if (!section) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      var index = Number(section.getAttribute("data-cms-section"));

      highlight(index, false);
      window.parent.postMessage(
        { type: CMS_SECTION_PICKED, index: index },
        "*"
      );
    },
    true
  );

  function injectScript(source) {
    if (!source) {
      return;
    }

    var script = document.createElement("script");

    // The page's CSP uses 'strict-dynamic', so a script added by this
    // already-trusted script is allowed to run.
    script.textContent = source;
    document.body.appendChild(script);
  }

  window.addEventListener("message", function (event) {
    // The admin is the only window that should be talking to us, and it
    // is the one that framed us.
    if (event.source !== window.parent || !event.data) {
      return;
    }

    if (event.data.type === STRAPI_SCRIPT) {
      injectScript(event.data.payload && event.data.payload.script);
      return;
    }

    if (event.data.type === CMS_REVIEW_MODE) {
      if (event.data.on) {
        document.documentElement.setAttribute("data-cms-reviewing", "true");
        highlight(null);
      } else {
        document.documentElement.removeAttribute("data-cms-reviewing");
      }

      return;
    }

    if (event.data.type === CMS_CHANGED) {
      markChanged(event.data.positions);
      return;
    }

    if (event.data.type === CMS_HIGHLIGHT) {
      // Only scroll when asked. Hovering a list on the other side of
      // the glass should not move the page under the reader's eyes.
      highlight(event.data.index, event.data.scroll === true);
      return;
    }

    if (event.data.type === STRAPI_UPDATE) {
      // The page is rendered server-side, so the simplest correct
      // refresh is to fetch it again.
      window.location.reload();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", announceReady);
  } else {
    announceReady();
  }
})();
