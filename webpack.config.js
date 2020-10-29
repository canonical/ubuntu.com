/* eslint-env node */

const entry = require("./webpack.config.entry.js");
const rules = require("./webpack.config.rules.js");

const production = process.env.ENVIRONMENT !== "devel";

module.exports = {
  entry: entry,
  output: {
    filename: "[name].js",
    path: __dirname + "/static/js/dist",
  },
  mode: production ? "production" : "development",
  devtool: production ? "source-map" : "eval-source-map",
  module: {
    rules: rules,
  },
};
