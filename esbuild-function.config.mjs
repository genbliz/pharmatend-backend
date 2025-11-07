// @ts-check
import { startBuild } from "./esbuild-base-config.mjs";
import copy from "esbuild-copy-files-plugin";

/**
 * @param {boolean} canOptimize
 */
async function buildIt(canOptimize) {
  await startBuild(
    {
      outExtension: { ".js": ".mjs" },
      outdir: "dist-func",
      tsconfig: "tsconfig-build.json",
      entryPoints: [
        { out: "serverHandler/index", in: "src/func/serverHandler.ts" },
        // { out: "jobHandler/index", in: "src/func/jobHandler.ts" },
        // { out: "queueHandler/index", in: "src/func/queueHandler.ts" },
        // { out: "warmUpHandler/index", in: "src/func/warmUpHandler.ts" },
        // //
        // { out: "connectHandler/index", in: "src/func/ws/connectHandler.ts" },
        // { out: "messageHandler/index", in: "src/func/ws/messageHandler.ts" },
        // { out: "disconnectHandler/index", in: "src/func/ws/disconnectHandler.ts" },
      ],
      plugins: [
        copy({
          source: ["./assets"],
          target: "./dist-func/serverHandler",
          copyWithFolder: true,
        }),
        copy({
          source: ["./assets"],
          target: "./dist-func/jobHandler",
          copyWithFolder: true,
        }),
        copy({
          source: ["./assets"],
          target: "./dist-func/queueHandler",
          copyWithFolder: true,
        }),
        copy({
          source: ["./assets"],
          target: "./dist-func/messageHandler",
          copyWithFolder: true,
        }),
      ],
    },
    canOptimize,
  );
}

buildIt(true).catch((e) => {
  console.error(e);
  process.exit(1);
});
