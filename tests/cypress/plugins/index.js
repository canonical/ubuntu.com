/// <reference types="cypress" />
const puppeteer = require("puppeteer");

async function clearBrowserCookies(page) {
  const client = await page.target().createCDPSession();
  await await client.send("Network.clearBrowserCookies");
}

module.exports = async (on, config) => {
  let cookies;

  on("task", {
    log(message) {
      console.log(message);

      return null;
    },
    table(message) {
      console.table(message);

      return null;
    },
    login({ username, password }) {
      let browser;
      if (cookies) {
        return { cookies };
      } else {
        return (async () => {
          try {
            browser = await puppeteer.launch({
              ignoreHTTPSErrors: true,
              headless: false,
              args: [
                `--unsafely-treat-insecure-origin-as-secure=${config.baseUrl}`,
              ],
            });
            const page = await browser.newPage();
            clearBrowserCookies(page);

            page.on("error", (err) => {
              throw new Error("Puppeteer error:", err);
            });

            await page.goto(config.baseUrl + "/login?test_backend=true", {
              // The app redirects to the login-page
              waitUntil: "networkidle2", // Wait until login-page has been reached
            });
            await page.click("#cookie-policy-button-accept");
            await page.type("#id_email", username); // Insert username in form
            await page.type("#id_password", password); // Insert password
            await Promise.all([
              page.click('button[type="submit"]'), // Click login button
              page.waitForNavigation(),
            ]);
            await Promise.all([
              page.click('button[type="submit"]'), // Click "Yes, log me in"
              page.waitForNavigation(),
            ]);

            await page.waitForNavigation({ waitUntil: "networkidle2" });

            cookies = await page.cookies();
            await browser.close();

            return { cookies };
          } catch (error) {
            browser.close();
            throw new Error(error);
          }
        })();
      }
    },
  });
};
