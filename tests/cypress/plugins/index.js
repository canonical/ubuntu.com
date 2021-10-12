/// <reference types="cypress" />
const puppeteer = require("puppeteer");

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
      if (cookies) {
        return { cookies };
      } else {
        return (async () => {
          const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true,
            headless: false,
          });
          const page = await browser.newPage();

          await page.goto(config.baseUrl + "/login?test_backend=true", {
            // The app redirects to the login-page
            waitUntil: "networkidle2", // Wait until login-page has been reached
          });
          await page.click("#cookie-policy-button-accept");
          await page.type("#id_email", username); // Insert username in form
          await page.type("#id_password", password); // Insert password
          await page.click('button[type="submit"]'); // Click login button
          await page.waitForNavigation({ waitUntil: "networkidle2" });
          await page.click('button[type="submit"]'); // Click "Yes, log me in"

          await page.waitForNavigation({ waitUntil: "networkidle2" });
          await page.click("#proceed-button"); // dismiss Chrome built-in warning: "The information that you’re about to submit is not secure"
          await page.waitForTimeout(5000); // puppeteer doesn't respond to waitForNavigation at this point
          cookies = await page.cookies();
          await browser.close();
          return { cookies };
        })();
      }
    },
  });
};
