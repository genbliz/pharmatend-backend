import fs from "node:fs";
import { glob } from "glob";

const shouldIgnore = (importPath) => {
  return (
    importPath.endsWith(".js") ||
    importPath.endsWith(".json") ||
    importPath.endsWith(".ts") ||
    importPath.endsWith(".tsx") ||
    importPath.endsWith(".cjs") ||
    importPath.endsWith(".cts") ||
    importPath.endsWith(".mjs") ||
    importPath.endsWith(".mts")
  );
};

// Regex matches any import line with relative or alias path (including multiline imports)
const importRegex = /import\s*[\s\S]*?\sfrom\s*['"](\.{1,2}\/[^'"]+|@\/[^'"]+)['"]/gm;

const addJsExtensionToImports = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");

  const updated = content.replace(importRegex, (match, importPath) => {
    if (shouldIgnore(importPath)) return match;
    return match.replace(importPath, `${importPath}.js`);
  });

  if (content !== updated) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`✅ Updated: ${filePath}`);
  }
};

const run = async () => {
  const files = await glob("cdk/**/*.{ts,tsx}", { absolute: true });

  for (const file of files) {
    addJsExtensionToImports(file);
  }

  console.log("🎉 All done!");
};

run().catch((e) => console.error(e));
