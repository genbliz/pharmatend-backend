//@ts-check
const ncc = require("@vercel/ncc");
const path = require("node:path");
const fs = require("node:fs");
const appRoot = require("app-root-path");

function getFullPathFromRoot(fileOrDirPath) {
  return path.resolve(appRoot.path, fileOrDirPath);
}

const input = getFullPathFromRoot("dist/server.js");
const output = getFullPathFromRoot("dist/index.js");

function main() {
  ncc(input, {
    // // provide a custom cache path or disable caching
    // cache: "./.cache/ncc",
    // // externals to leave as requires of the build
    // externals: ["externalpackage"],
    // // directory outside of which never to emit assets
    // filterAssetBase: process.cwd(), // default
    // minify: false, // default
    // sourceMap: false, // default
    // assetBuilds: false, // default
    // sourceMapBasePrefix: "../", // default treats sources as output-relative
    // // when outputting a sourcemap, automatically include
    // // source-map-support in the output file (increases output by 32kB).
    // sourceMapRegister: true, // default
    // watch: false, // default
    // license: "", // default does not generate a license file
    // v8cache: false, // default
    // quiet: false, // default
    // debugLog: false, // default
  }).then(({ code, map, assets }) => {
    fs.writeFileSync(output, code);
  });
}

main();
