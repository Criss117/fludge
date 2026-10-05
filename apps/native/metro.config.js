// Learn more https://docs.expo.io/guides/customizing-metro
const { withRozenite } = require("@rozenite/metro");
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push("sql");

module.exports = withRozenite(config, {
  enabled:
    process.env.WITH_ROZENITE === "true" ||
    process.env.NODE_ENV !== "production",
  include: [
    "@rozenite/tanstack-query-plugin",
    "@rozenite/network-activity-plugin",
  ],
  pluginDisplay: "tabs",
});
