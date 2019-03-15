
module.exports = {
  entry: {
    main: [
      './static/js/core.js',
      './static/js/navigation.js',
      './static/js/scratch.js'
    ],
    forms: './static/js/forms.js'
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
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
