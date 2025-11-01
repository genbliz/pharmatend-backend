//@ts-check
const path = require("node:path");
const fs = require("node:fs");
const appRoot = require("app-root-path");
const rimraf = require("rimraf");

function getFullPathFromRoot(fileOrDirPath) {
  return path.resolve(appRoot.path, fileOrDirPath);
}

const outputFile = getFullPathFromRoot("dist-bin/caxa-out/server-app.exe");

const outputDir = getFullPathFromRoot("dist-bin/caxa-in");

const sqlitePrebuildSrc = getFullPathFromRoot("node_modules/sqlite3/lib");
const sqlitePrebuildDest = getFullPathFromRoot("dist-bin/caxa-in/lib");

const leveldownPrebuildSrc = getFullPathFromRoot("node_modules/leveldown/prebuilds");
const leveldownPrebuildDest = getFullPathFromRoot("dist-bin/caxa-in/prebuilds");

(async () => {
  await rimraf.rimraf([outputDir, outputFile]);

  await fs.promises.cp(getFullPathFromRoot("dist/index.js"), getFullPathFromRoot("dist-bin/caxa-in/index.js"), {
    recursive: true,
  });

  await fs.promises.cp(sqlitePrebuildSrc, sqlitePrebuildDest, { recursive: true });
  await fs.promises.cp(leveldownPrebuildSrc, leveldownPrebuildDest, { recursive: true });

  const caxa = await import("caxa").then((ca) => ca);

  await caxa.default({
    input: outputDir,
    output: outputFile,
    command: ["{{caxa}}/node_modules/.bin/node", "{{caxa}}/index.js"],
  });
})();
