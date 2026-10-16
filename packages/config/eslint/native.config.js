import expoConfig from "eslint-config-expo/flat.js";

import baseConfig from "./base.config.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...expoConfig,
  ...baseConfig,
  {
    files: ["**/*.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];
