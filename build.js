let esbuild = require("esbuild");

let entries = {
  contributions: "./static/js/src/contributions.js",
  "desktop-statistics": "./static/js/src/desktop-statistics.js",
  tutorials: "./static/js/src/tutorials.js",
  forms: "./static/js/src/forms.js",
  "image-download": "./static/js/src/image-download.js",
  main: "./static/js/src/main.js",
  "release-chart": "./static/js/src/release-chart.js",
  tabotronic: "./static/js/src/tabotronic.js",
  appliance: "./static/js/src/appliance.js",
  costCalculator: "./static/js/src/openstack/react/app.jsx",
  "ua-payment-modal": "./static/js/src/ua-payment-modal.js",
  "ua-payment-methods": "./static/js/src/ua-payment-methods.js",
  "sticky-nav": "./static/js/src/sticky-nav.js",
  imageBuilder: "./static/js/src/imageBuilder.js",
  chassisAnimation: "./static/js/src/chassis-animation.js",
  cve: "./static/js/src/cve/cve.js",
  productSelector: "./static/js/src/advantage/subscribe/product-selector.js",
  advantageAccountUsers: "./static/js/src/advantage/users/app.jsx",
  cubeMicrocertifications: "./static/js/src/cube/app.jsx",
  openstackChart: "./static/js/src/openstack-chart.js",
  uaSubscribe: "./static/js/src/advantage/subscribe/react/app.jsx",
  "cloud-price-slider": "./static/js/src/cloud-price-slider.js",
  "certified-search-results": "./static/js/src/certified-search-results.js",
  openstackDeploymentChart: "./static/js/src/openstack-deployment-chart.js",
};

for (const [key, value] of Object.entries(entries)) {
  const options = {
    entryPoints: [value],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "static/js/dist/" + key + ".js",
    target: ["chrome58", "firefox57", "safari11", "edge16"],
    define: {
      "process.env.NODE_ENV":
        // Explicitly check for 'development' so that this defaults to
        // 'production' in all other cases.
        process && process.env && process.env.NODE_ENV === "development"
          ? '"development"'
          : '"production"',
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
