//@ts-check
const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const nodeExternals = require("webpack-node-externals");

module.exports = merge.merge(common, {
  mode: "development",
  output: {
    libraryTarget: "commonjs",
    filename: "[name]-dev.js",
    path: path.resolve(__dirname, "./dist-dev"),
  },
  devtool: "source-map",
  externals: [nodeExternals()],
});
