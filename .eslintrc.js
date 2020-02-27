module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "plugins": [
      "only-warn"
    ],
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "dataLayer": "readonly",
        "d3": "readonly",
        "topojson": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
      "indent": ["error", 2, {
        "SwitchCase": 1
      }],
      "linebreak-style": ["error", "unix"],
      "semi": ["error", "always"],
      "object-curly-spacing": ["error", "always"]
    }
};
