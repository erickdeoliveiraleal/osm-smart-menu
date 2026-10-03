const path = require("path");

module.exports = {
  target: ['web', 'es2020'], // emits `globalThis` instead of `Function('return this')`
  optimization: {
    minimize: false, // ease code review by webextension stores
  },
  devtool: false, // related to optimization.minimize=false and https://bugzilla.mozilla.org/show_bug.cgi?id=1437937
  entry: {
    "injectable-content-script": "./src/injectable-content-script.ts",
    "options/main": "./src/options/main.ts",
    "popup/main": "./src/popup/main.ts",
    "background-listeners-setup": "./src/background-listeners-setup.ts"
  },
  output: {
    path: path.resolve(__dirname, "addon"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(html|svelte)$/,
        use: {
          loader: 'svelte-loader',
          options: {
            preprocess: require('svelte-preprocess')({}), // TypeScript support
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.svelte', '.mjs'],
    conditionNames: ['svelte', 'browser', 'import'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
};
