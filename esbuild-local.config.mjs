// @ts-check
import { startBuild } from "./esbuild-base-config.mjs";

/**
 * @param {boolean} canOptimize
 */
async function buildIt(canOptimize) {
  await startBuild(
    {
      outdir: "dist",
      tsconfig: "tsconfig-build.json",
      entryPoints: [{ out: "server", in: "src/server.ts" }],
    },
    canOptimize,
  );
}

buildIt(true).catch((e) => {
  console.error(e);
  process.exit(1);
});
