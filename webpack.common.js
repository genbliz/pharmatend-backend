//@ts-check
const path = require("path");
const merge = require("webpack-merge");
const base = require("./webpack.base.js");

const config = merge.merge(base, {
  mode: "production",
  entry: {
    server: path.resolve(__dirname, "./src/server.ts"),
  },
  output: {
    libraryTarget: "commonjs",
    filename: "[name].js",
    path: path.resolve(__dirname, "./dist"),
  },
});

module.exports = config;
