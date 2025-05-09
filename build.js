let esbuild = require("esbuild");
const path = require("path");
const { sassPlugin } = require("esbuild-sass-plugin");

let entries = {
  contributions: "./static/js/src/contributions.js",
  tutorials: "./static/js/src/tutorials.js",
  "side-navigation": "./static/js/src/side-navigation.js",
  "dynamic-toc": "./static/js/src/dynamic-toc.js",
  "image-download": "./static/js/src/image-download.js",
  main: "./static/js/src/main.js",
  "release-chart-manager": "./static/js/src/release-chart-manager.js",
  "developer-chart": "./static/js/src/developer-chart.js",
  tabotronic: "./static/js/src/tabotronic.js",
  appliance: "./static/js/src/appliance.js",
  costCalculator: "./static/js/src/openstack/react/app.jsx",
  "ua-payment-methods": "./static/js/src/ua-payment-methods.js",
  "sticky-nav": "./static/js/src/sticky-nav.js",
  chassisAnimation: "./static/js/src/chassis-animation.js",
  cve: "./static/js/src/cve/cve.js",
  notices: "./static/js/src/cve/notices.js",
  noticesLanding: "./static/js/src/cve/notices-landing.js",
  advantageAccountUsers: "./static/js/src/advantage/users/app.jsx",
  shopCheckout: "./static/js/src/advantage/subscribe/checkout/app.tsx",
  advantageOffers: "./static/js/src/advantage/offers/app.jsx",
  distributor: "./static/js/src/advantage/distributor/app.jsx",
  openstackChart: "./static/js/src/openstack-chart.js",
  uaSubscribe: "./static/js/src/advantage/subscribe/react/app.jsx",
  uaSubscriptions: "./static/js/src/advantage/react/app.tsx",
  "cloud-price-slider": "./static/js/src/cloud-price-slider.js",
  "certified-search-results": "./static/js/src/certified-search-results.js",
  openstackDeploymentChart: "./static/js/src/openstack-deployment-chart.js",
  blender: "./static/js/src/advantage/subscribe/blender/app.tsx",
  utmInheritance: "./static/js/src/utm-inheritance.js",
  "random-partner-logos": "./static/js/src/random-partner-logos.js",
  credEnterprisePurchasing: "./static/js/src/advantage/credentials/app.tsx",
  activate: "./static/js/src/activate.js",
  "chiseled-chart": "./static/js/src/charts/chiseled-chart.js",
  tabbedContent: "./static/js/src/tabbed-content.js",
  credentialsDashboard:
    "./static/js/src/advantage/credentials/dashboard/app.tsx",
  "canonical-cla": "./static/js/src/canonical-cla/app.tsx",
  "table-of-contents": "./static/js/src/table-of-contents.js",
};

const isDev = process && process.env && process.env.NODE_ENV === "development";

// if CAPTCHA_TESTING_API_KEY doesn't exist then we are on demo / staging / production and use the real API key
const captchaKey =
  (process && process.env && process.env.CAPTCHA_TESTING_API_KEY) ||
  "6LfYBloUAAAAAINm0KzbEv6TP0boLsTEzpdrB8if";

for (const [key, value] of Object.entries(entries)) {
  const options = {
    plugins: [sassPlugin()],
    entryPoints: [value],
    bundle: true,
    minify: !isDev,
    nodePaths: [path.resolve(__dirname, "./static/js/src")],
    sourcemap: !isDev,
    outfile: "static/js/dist/" + key + ".js",
    loader: {
      ".js": "jsx",
      ".ts": "ts",
      ".tsx": "tsx",
      ".jsx": "jsx",
    },
    jsx: "automatic",
    target: ["chrome90", "firefox88", "safari14", "edge90"],
    define: {
      "process.env.NODE_ENV":
        // Explicitly check for 'development' so that this defaults to
        // 'production' in all other cases.
        isDev ? '"development"' : '"production"',
      "process.env.CAPTCHA_TESTING_API_KEY": `"${captchaKey}"`,
    },
  };

  esbuild
    .build(options)
    .then((result) => {
      console.log("Built " + key + ".js");
    })
    // Fail the build if there are errors.
    .catch(() => process.exit(1));
}
