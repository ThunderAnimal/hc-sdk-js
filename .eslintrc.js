module.exports = {
  extends: ["eslint:recommended", "airbnb-base", "prettier"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 8,
    sourceType: "module"
  },
  plugins: ["import", "prettier"],
  rules: {
    "func-names": "warn",
    "class-methods-use-this": "error",
    "arrow-body-style": ["error", "as-needed"],
    complexity: ["error", 15], // push down to 10
    "max-depth": ["error", 4],
    "max-nested-callbacks": ["error", 3],

    // will be switched to error next sprint (airbnb default is error)
    "no-param-reassign": ["warn"]
  },
  settings: {
    "import/resolver": {
      configurable: {
        config: "./src/config/develop",
        "session-handler": "./src/lib/sessionHandler/web"
      }
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  globals: {
    zkit_sdk: true,
    NODE: true,
    __karma__: true,
    VERSION: true
  }
};
