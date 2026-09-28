/*
  Whole-bar-clickable announcement bar with a full-height close button
  (see templates/templates/_announcement_bar.html). Dismissal is
  remembered via a cookie read server-side in webapp/announcement_bar.py,
  so a reload doesn't flash the bar back before this script runs.
*/

// Must match DISMISS_COOKIE_NAME in webapp/announcement_bar.py
const DISMISS_COOKIE_NAME = "_announcement_bar_dismissed";
const DISMISS_MAX_AGE_SECONDS = 72 * 60 * 60;

const bar = document.querySelector(".announcement-bar");

if (bar) {
  bar.addEventListener("click", (event) => {
    if (event.target.closest(".announcement-bar__close")) {
      document.cookie =
        DISMISS_COOKIE_NAME +
        "=" +
        bar.dataset.announcementId +
        ";max-age=" +
        DISMISS_MAX_AGE_SECONDS +
        ";path=/;SameSite=Lax";
      bar.remove();
      return;
    }

    // Let the visible CTA link navigate natively; otherwise treat a click
    // anywhere else on the bar as activating that same link.
    if (!event.target.closest("a")) {
      window.location.href = bar.dataset.href;
    }
  });
}
