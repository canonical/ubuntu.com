import type { BrowserContext, Route } from "@playwright/test";

/**
 * Same-origin endpoints that proxy a live third-party API.
 */
const STUBBED_PATHS: Record<string, string> = {
  "/takeovers.json": '{"takeovers": []}',
  "/blog/latest-news": '{"latest_article": null, "featured_articles": []}',
};

/**
 * Mocks out all network requests except for those to the given baseURL, and
 * stubs out certain same-origin endpoints that proxy a live third-party API.
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
