/**
 * Live preview handshake for CMS pages shown inside the Strapi admin.
 *
 * Strapi's preview panel speaks a small postMessage protocol:
 *
 *   page  → admin   previewReady   the page is loaded and listening
 *   admin → page    strapiScript   a script enabling visual editing
 *   admin → page    strapiUpdate   the document changed; re-render
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

  function announceReady() {
    window.parent.postMessage({ type: PREVIEW_READY }, "*");
  }

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
