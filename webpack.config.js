/* eslint-env node */

const entry = require("./webpack.config.entry.js");
const rules = require("./webpack.config.rules.js");

const TerserPlugin = require("terser-webpack-plugin");

const production = process.env.ENVIRONMENT !== "devel";

// turn on terser plugin on production
const minimizer = production
  ? [
      new TerserPlugin({
        sourceMap: true,
      }),
    ]
  : [];

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
  optimization: {
    minimize: true,
    minimizer,
  },
};
