// @ts-check
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

const config = merge.merge(common, {
  mode: "production",
  entry: {
    server_bin: path.resolve(__dirname, "./src/server.ts"),
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
});

module.exports = config;
