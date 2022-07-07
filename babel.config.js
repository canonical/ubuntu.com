module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["last 2 versions"],
          node: "current",
        },
      },
    ],
    "@babel/preset-react",
    "@babel/preset-typescript",
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        regenerator: true,
      },
      "@babel/plugin-syntax-jsx",
    ],
    "@babel/plugin-proposal-class-properties",
  ],
};
