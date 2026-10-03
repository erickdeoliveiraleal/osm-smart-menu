const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  target: ['web', 'es2020'], // emits `globalThis` instead of `Function('return this')`
  optimization: {
    // removes unused code (most of the Svelte runtime) but keeps the output readable for webextension store reviewers
    minimizer: [new TerserPlugin({
      extractComments: false,
      terserOptions: {
        mangle: false,
        compress: { defaults: false, dead_code: true, unused: true },
        format: { beautify: true, comments: false },
      },
    })],
  },
  performance: { hints: false }, // size limits are meant for websites, not for extension files loaded from disk
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
        use: 'svelte-loader', // Svelte 5 compiles `<script lang="ts">` natively
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
