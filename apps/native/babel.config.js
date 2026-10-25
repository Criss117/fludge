module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [["inline-import", { extensions: [".sql"] }]],
    overrides: [
      {
        test: (filename) =>
          typeof filename === "string" && /node_modules[\\/]@orpc[\\/]/.test(filename),
        plugins: ["@babel/plugin-transform-parameters"],
      },
    ],
  };
};
