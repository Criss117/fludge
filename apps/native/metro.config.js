// Learn more https://docs.expo.io/guides/customizing-metro
const { withRozenite } = require("@rozenite/metro");
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withRozenite(
  withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
    // relative path to your global.css file (from previous step)
    cssEntryFile: "./src/globals.css",
    // (optional) path where we gonna auto-generate typings
    // defaults to project's root
    dtsFile: "./src/uniwind-types.d.ts",
  }),
  {
    enabled:
      process.env.WITH_ROZENITE === "true" ||
      process.env.NODE_ENV !== "production",
    include: [
      "@rozenite/tanstack-query-plugin",
      "@rozenite/network-activity-plugin",
    ],
    pluginDisplay: "tabs",
  }
);
