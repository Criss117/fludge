const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = [
  ...expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: [".expo/**", "node_modules/**", "coverage/**", "dist/**"],
  },
];
