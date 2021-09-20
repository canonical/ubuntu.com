/// <reference types="cypress" />
const puppeteer = require("puppeteer");

module.exports = async (on) => {
  on("task", {
    login({ username, password }) {
      return (async () => {
        const browser = await puppeteer.launch({
          ignoreHTTPSErrors: true,
          headless: false,
        });
        const page = await browser.newPage();

        await page.goto("http://192.168.64.3:8001/login?test_backend=true", {
          // The app redirects to the login-page
          waitUntil: "networkidle2", // Wait until login-page has been reached
        });
        await page.click("#cookie-policy-button-accept");
        await page.type("#id_email", username); // Insert username in form
        await page.type("#id_password", password); // Insert password
        await page.click('button[type="submit"]'); // Click login button
        await page.waitForNavigation({ waitUntil: "networkidle2" });
        await page.setBypassCSP(true);
        await page.click('button[type="submit"]'); // Click login button
        await page.waitForNavigation({ waitUntil: "networkidle2" });
        await page.click("#proceed-button");
        await page.waitForTimeout(5000);
        const cookies = await page.cookies();
        await browser.close();
        return { cookies };
      })();
    },
  });
};
