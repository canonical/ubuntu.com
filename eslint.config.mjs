/** @type {import('eslint').Linter.FlatConfig[]} */
import eslint from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import tsParser from '@typescript-eslint/parser'
import tseslint from 'typescript-eslint';

import globals from "globals";

const config = [
  eslint.configs.recommended.rules,
  reactPlugin.configs.flat.recommended,
  ...tseslint.configs.recommended,
  {
    // env: {
    //   node: true,
    //   browser: true,
    //   es6: true,
    //   jest: true,
    // },
    // extends: [
    //   "eslint:recommended",
    //   "plugin:react/recommended",
    //   "plugin:@typescript-eslint/recommended",
    // ],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
        dataLayer: "readonly",
        d3: "readonly",
        topojson: "readonly",
        ga: "readonly",
        grecaptcha: "readonly",
        serialize: "readonly",
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
        ...globals.es2022
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true
      }
      },
    },
    // rules: {
    //   semi: ["error", "always"],
    //   "@typescript-eslint/explicit-module-boundary-types": "off",
    //   "@typescript-eslint/no-empty-function": "off",
    //   "@typescript-eslint/no-this-alias": "off",
    //   "@typescript-eslint/no-var-requires": "off",
    //   "@typescript-eslint/no-unused-vars": "off",
    //   "no-prototype-builtins": "off",
    // },
    files: ["**/*.tsx"],
    rules: {
      semi: ["error", "always"],
      "react/prop-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-prototype-builtins": "off",
    },
  },
];

export default config;
