// Snapshot configuration for Percy visual testing
const baseURL = "http://localhost:8001";
const timeout = 30000;

const acceptCookies = () => {
  const banner = document.querySelector(".cookie-policy");
  banner?.querySelector("#cookie-policy-button-accept")?.click();
};

// Common snapshot config factory
const makeSnapshot = (path) => ({
  name: path === "/" ? "/" : path,
  url: `${baseURL}${path === "/" ? "" : path}`,
  waitForTimeout: timeout,
  execute: { beforeSnapshot: acceptCookies },
});

const routes = [
  "/",
  "/desktop",
  "/download",
  "/download/desktop",
  "/pricing/desktop",
  "/pro",
  "/ai",
  "/robotics",
  "/core",
  "/cloud",
  "/summit",
];

module.exports = routes.map(makeSnapshot);
