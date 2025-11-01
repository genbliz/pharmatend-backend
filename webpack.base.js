//@ts-check
const merge = require("webpack-merge");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const base = {};

const config = merge.merge(base, {
  mode: "production",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    // @ts-ignore
    plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
  },
  performance: {
    hints: false,
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
  },
});

module.exports = config;
