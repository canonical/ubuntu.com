/*
  Full-bar clickable announcement bar via a stretched link (see
  templates/templates/_announcement_bar.html), with a full-height close
  button layered above it. Dismissal is remembered via a cookie read
  server-side in webapp/announcement_bar.py, so a reload doesn't flash
  the bar back before this script runs.
*/

// Must match DISMISS_COOKIE_NAME in webapp/announcement_bar.py
const DISMISS_COOKIE_NAME = "_announcement_bar_dismissed";
// Browsers cap cookie lifetime at 400 days, the longest a cookie can persist
const DISMISS_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

const bar = /** @type {HTMLElement | null} */ (
  document.querySelector(".announcement-bar")
);
const closeButton = /** @type {HTMLElement | null} */ (
  bar && bar.querySelector(".announcement-bar__close")
);

if (bar && closeButton) {
  closeButton.addEventListener("click", () => {
    document.cookie =
      DISMISS_COOKIE_NAME +
      "=" +
      bar.dataset.announcementId +
      ";max-age=" +
      DISMISS_MAX_AGE_SECONDS +
      ";path=/;SameSite=Lax";
    bar.remove();
  });
}
