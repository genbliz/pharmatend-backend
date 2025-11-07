// @ts-check
import { build } from "esbuild";

/**
 * @type {import('esbuild').BuildOptions}
 */
const configSettings = {
  bundle: true,
  platform: "node",
  target: "node22",
  outdir: "dist",
  tsconfig: "tsconfig-build.json",
  packages: "external",
  outExtension: { ".js": ".mjs" },
  format: "esm",
  resolveExtensions: [".tsx", ".mts", ".ts", ".mjs", ".cjs", ".js", ".json"],
};

/**
 * @param {import('esbuild').BuildOptions} config
 * @param {boolean} canOptimize
 */
export async function startBuild(config, canOptimize) {
  /**
   * @type {import('esbuild').BuildOptions}
   */
  const configSettings01 = {
    ...configSettings,
    ...config,
    minify: canOptimize ? true : true,
    sourcemap: canOptimize ? true : true,
    legalComments: canOptimize ? "none" : undefined,
    treeShaking: canOptimize ? true : undefined,
    define: canOptimize
      ? {
          "process.env.NODE_ENV": '"production"',
        }
      : undefined,
  };
  await build(configSettings01);
}
