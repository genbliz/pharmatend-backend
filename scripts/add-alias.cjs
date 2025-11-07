//@ts-check
const fs = require("fs");
const path = require("path");

const fileList = fs.globSync("./src/**/*.{ts,tsx}");

// console.log({ fileList });

const srcRoot = "src/app";

const replaceImport = (/** @type {string} */ filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  const dir = path.dirname(filePath);

  const updated = content.replace(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g, (match, relPath) => {
    const absImportPath = path.resolve(dir, relPath);

    console.log({ absImportPath });

    const relativeToSrc = path.relative(srcRoot, absImportPath).replace(/\\/g, "/");
    return `from "@/${relativeToSrc}"`;
  });

  if (updated !== content) {
    console.log(`Updated: ${filePath}`);
    fs.writeFileSync(filePath, updated, "utf-8");
  }
};

for (const filePath of fileList) {
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    replaceImport(filePath);
  }
}
