module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "eslint-config-prettier",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    dataLayer: "readonly",
    d3: "readonly",
    topojson: "readonly",
    ga: "readonly",
    grecaptcha: "readonly",
    serialize: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    requireConfigFile: false,
    babelOptions: {
      plugins: ["@babel/plugin-syntax-jsx", "@typescript-eslint"],
      presets: ["@babel/preset-react"],
    },
  },
  rules: {
    semi: ["error", "always"],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "no-prototype-builtins": "off",
  },
  overrides: [
    {
      files: ["**/*.tsx"],
      rules: {
        "react/prop-types": "off",
      },
    },
  ],
};
