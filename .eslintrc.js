module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true
  },
  extends: ["eslint:recommended", "eslint-config-prettier", "plugin:cypress/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    dataLayer: "readonly",
    d3: "readonly",
    topojson: "readonly",
    ga: "readonly",
    grecaptcha: "readonly",
    serialize: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    semi: ["error", "always"],
    "no-prototype-builtins": "off"
  }
};
