module.exports = {
  entry: {
    desktopStatistics: "./static/js/desktopStatistics.js",
    tutorials: [
      "./static/js/tutorial-list.js",
      "./static/js/tutorial.js"
    ],
    forms: "./static/js/forms.js",
    main: [
      "./static/js/dynamic-contact-form.js",
      "./static/js/core.js",
      // Temporary fix for IE11 (see: https://github.com/canonical-web-and-design/ubuntu.com/issues/6660)
      // "./static/js/navigation.js",
      "./static/js/formValidation.js",
      "./static/js/scratch.js"
    ],
    "release-chart": "./static/js/release-chart.js",
    tabotronic: "./static/js/tabotronic.js",
    stickyNav: "./static/js/stickyNav.js"
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
