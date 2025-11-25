const fs = require("fs");
const yaml = require("js-yaml");

// Snapshot configuration for Percy visual testing
const baseURL = "http://localhost:8001";
const timeout = 30000;

const acceptCookies = () => {
  const banner = document.querySelector(".cookie-policy");
  banner?.querySelector("#cookie-policy-button-accept-all")?.click();
};

// Common snapshot config factory
const makeSnapshot = (path) => ({
  name: path,
  url: `${baseURL}${path === "/" ? "" : path}`,
  waitForTimeout: timeout,
  execute: { beforeSnapshot: acceptCookies },
});

const data = yaml.load(fs.readFileSync("test-links.yaml", "utf8"));

const routes = data.links.map((link) =>
  link.url.replace("https://ubuntu.com/", "/"),
);

module.exports = routes.map(makeSnapshot);
