module.exports = {
  entry: {
    contributions: "./static/js/src/contributions.js",
    "desktop-statistics": "./static/js/src/desktop-statistics.js",
    tutorials: [
      "./static/js/src/tutorial-list.js",
      "./static/js/src/tutorial.js",
    ],
    forms: "./static/js/src/forms.js",
    "image-download": "./static/js/src/image-download.js",
    main: [
      "./static/js/src/polyfills.js",
      "./static/js/src/contextual-menu.js",
      "./static/js/src/dynamic-contact-form.js",
      "./static/js/src/core.js",
      "./static/js/src/navigation.js",
      "./static/js/src/form-validation.js",
      "./static/js/src/scratch.js",
    ],
    "release-chart": "./static/js/src/release-chart.js",
    tabotronic: "./static/js/src/tabotronic.js",
    "tco-calculator": "./static/js/src/tco-calculator.js",
    "sticky-nav": "./static/js/src/sticky-nav.js",
    cve: "./static/js/src/cve/cve.js",
  },
  mode: process.env.ENVIRONMENT === "devel" ? "development" : "production",
  output: {
    filename: "[name].min.js",
    path: __dirname + "/static/js/build",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
