//@ts-check

const { exec } = require("pkg");
const path = require("node:path");
const fs = require("node:fs");
const appRoot = require("app-root-path");
const rimraf = require("rimraf");

function getFullPathFromRoot(fileOrDirPath) {
  return path.resolve(appRoot.path, fileOrDirPath);
}

const inputFile = getFullPathFromRoot("dist-bin/pkg-in/index.js");

const outputDir = getFullPathFromRoot("dist-bin/pkg-in");
const outputFile = getFullPathFromRoot("dist-bin/pkg-out/server-app.exe");

const sqlitePrebuildSrc = getFullPathFromRoot("node_modules/sqlite3/lib");
const sqlitePrebuildDest = getFullPathFromRoot("dist-bin/pkg-in/lib");

const leveldownPrebuildSrc = getFullPathFromRoot("node_modules/leveldown/prebuilds");
const leveldownPrebuildDest = getFullPathFromRoot("dist-bin/pkg-in/prebuilds");
const config = getFullPathFromRoot("scripts/pkg-config/pkg-config.json");

async function main() {
  await rimraf.rimraf([outputDir, outputFile]);

  await fs.promises.cp(getFullPathFromRoot("dist/index.js"), inputFile, { recursive: true });

  await fs.promises.cp(sqlitePrebuildSrc, sqlitePrebuildDest, { recursive: true });
  await fs.promises.cp(leveldownPrebuildSrc, leveldownPrebuildDest, { recursive: true });

  await exec([inputFile, "--target", "node18-win-x64", "--config", config, "--output", outputFile]);
}

main().catch((e) => console.log(e));
