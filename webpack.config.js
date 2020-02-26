module.exports = {
  entry: {
    desktopStatistics: "./static/js/src/desktopStatistics.js",
    tutorials: [
      "./static/js/src/tutorial-list.js",
      "./static/js/src/tutorial.js"
    ],
    forms: "./static/js/src/forms.js",
    main: [
      "./static/js/src/polyfills.js",
      "./static/js/src/dynamic-contact-form.js",
      "./static/js/src/core.js",
      // Temporary fix for IE11 (see: https://github.com/canonical-web-and-design/ubuntu.com/issues/6660)
      // "./static/js/src/navigation.js",
      "./static/js/src/formValidation.js",
      "./static/js/src/scratch.js"
    ],
    "release-chart": "./static/js/src/release-chart.js",
    tabotronic: "./static/js/src/tabotronic.js",
    stickyNav: "./static/js/src/stickyNav.js"
  },
  mode: process.env.ENVIRONMENT === "devel" ? "development" : "production",
  output: {
    filename: "[name].min.js",
    path: __dirname + "/static/js/build"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  }
};
