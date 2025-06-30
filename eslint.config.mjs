import eslint from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import tsParser from '@typescript-eslint/parser';
import globals from "globals";
import html from '@html-eslint/eslint-plugin';

const config = [
  {
    extends: [eslint.configs.recommended, reactPlugin.configs.flat.recommended],
    languageOptions: {
      globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
        dataLayer: "readonly",
        d3: "readonly",
        topojson: "readonly",
        ga: "readonly",
        grecaptcha: "readonly",
        serialize: "readonly",
        "JSX": "readonly",
        "React": "readonly",
        "ReactDOM": "readonly",
        "ReactNode": "readonly",
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true
      }
      },
    },
    rules: {
      semi: ["error", "always"],
      "react/prop-types": "off",
      "no-redeclare": "off",
      "react/display-name": "off",
      "no-constant-binary-expression": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "react/react-in-jsx-scope": "off", 
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-prototype-builtins": "off",
    },
    files: ["**/*.jsx", "**/*.tsx", "**/*.js", "**/*.ts"],
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      }
    }
  },
  {
    files: ["**/*.html"],
    plugins: {
        html,
    },
    languageOptions: {
      // This tells the parser to treat {{ ... }} as template syntax,
      // so it won’t try to parse contents inside as regular HTML
      templateEngineSyntax: {
          "{{": "}}",
          "{%": "%}",
      },
  },
    language: "html/html",
    rules: {
        "html/no-duplicate-class": "error",
        "html/no-extra-spacing-attrs": ["error", {enforceBeforeSelfClose: true}],
        "html/no-trailing-spaces": "error",
    }
  }
];

export default config;
