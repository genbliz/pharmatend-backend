// @ts-check
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const TerserPlugin = require("terser-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const path = require("path");

const config = merge.merge(common, {
  mode: "production",
  entry: {
    server: path.resolve(__dirname, "./src/server.ts"),
  },
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          // extractComments: "all",
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      }),
    ],
  },
  externals: [nodeExternals()],
});

module.exports = config;
