import type { BrowserContext, Route } from "@playwright/test";

/**
 * Same-origin endpoints that proxy a live third-party API. They are
 * fetched by JS on every page load, are not covered by the Discourse VCR
 * cassette, and have no credentials in CI - so they 403 or hang against
 * the real network. No test asserts on them.
 */
const STUBBED_PATHS: Record<string, string> = {
  "/takeovers.json": '{"takeovers": []}',
  "/blog/latest-news": '{"latest_article": null, "featured_articles": []}',
};

/**
 * Block every request that does not belong to the site under test.
 *
 * `base.html` loads lazysizes from assets.ubuntu.com in a `defer` script
 * placed *before* navigation.js. Deferred scripts run in document order
 * and DOMContentLoaded waits for all of them, so a slow or blocked CDN
 * response delays navigation.js - and therefore `page.goto`, the nav
 * dropdown handlers and the lazily fetched dropdown content - by up to
 * the full test timeout. Serving third-party requests locally keeps the
 * suite hermetic and fast.
 */
export async function blockExternalRequests(
  context: BrowserContext,
  baseURL?: string
): Promise<void> {
  const allowedOrigin = baseURL ? new URL(baseURL).origin : undefined;

  await context.route("**/*", (route: Route) => {
    const url = new URL(route.request().url());

    if (allowedOrigin && url.origin === allowedOrigin) {
      const stub = STUBBED_PATHS[url.pathname];
      if (stub) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: stub,
        });
      }
      return route.continue();
    }

    // Empty 200 rather than abort: most of these are <script> and <img>
    // tags, and an aborted request surfaces as a page error.
    return route.fulfill({
      status: 200,
      contentType: "text/plain",
      body: "",
    });
  });
}
