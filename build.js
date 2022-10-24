let esbuild = require("esbuild");
const path = require("path");

let entries = {
  contributions: "./static/js/src/contributions.js",
  "desktop-statistics": "./static/js/src/desktop-statistics.js",
  tutorials: "./static/js/src/tutorials.js",
  "side-navigation": "./static/js/src/side-navigation.js",
  "image-download": "./static/js/src/image-download.js",
  main: "./static/js/src/main.js",
  "release-chart": "./static/js/src/release-chart.js",
  tabotronic: "./static/js/src/tabotronic.js",
  appliance: "./static/js/src/appliance.js",
  costCalculator: "./static/js/src/openstack/react/app.jsx",
  "ua-payment-methods": "./static/js/src/ua-payment-methods.js",
  "sticky-nav": "./static/js/src/sticky-nav.js",
  chassisAnimation: "./static/js/src/chassis-animation.js",
  cve: "./static/js/src/cve/cve.js",
  advantageAccountUsers: "./static/js/src/advantage/users/app.jsx",
  shopCheckout: "./static/js/src/advantage/subscribe/checkout/app.tsx",
  advantageOffers: "./static/js/src/advantage/offers/app.jsx",
  openstackChart: "./static/js/src/openstack-chart.js",
  uaSubscribe: "./static/js/src/advantage/subscribe/react/app.jsx",
  uaSubscriptions: "./static/js/src/advantage/react/app.tsx",
  "cloud-price-slider": "./static/js/src/cloud-price-slider.js",
  "certified-search-results": "./static/js/src/certified-search-results.js",
  openstackDeploymentChart: "./static/js/src/openstack-deployment-chart.js",
  blender: "./static/js/src/advantage/subscribe/blender/app.tsx",
  utmInheritance: "./static/js/src/utm-inheritance.js",
  "kernel-form": "./static/js/src/kernel-form.js",
  "random-partner-logos": "./static/js/src/random-partner-logos.js",
  "credEnterprisePurchasing": "./static/js/src/advantage/credentials/app.tsx",
  activate: "./static/js/src/activate.js"
};

const isDev = process && process.env && process.env.NODE_ENV === "development";

// if CAPTCHA_TESTING_API_KEY doesn't exist then we are on demo / staging / production and use the real API key
const captchaKey =
  (process && process.env && process.env.CAPTCHA_TESTING_API_KEY) ||
  "6LfYBloUAAAAAINm0KzbEv6TP0boLsTEzpdrB8if";

for (const [key, value] of Object.entries(entries)) {
  const options = {
    entryPoints: [value],
    bundle: true,
    minify: isDev ? false : true,
    nodePaths: [path.resolve(__dirname, "./static/js/src")],
    sourcemap: isDev ? false : true,
    outfile: "static/js/dist/" + key + ".js",
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
