import { getFullPathFromRoot } from "#cdk/helpers/util.js";
import { IEnvConfigExtra } from "#cdk/types/index.js";
import { envConfig } from "@/config/env.js";
import dotenv from "dotenv";
import fs from "node:fs";

export function loadEnvironmentalVariable(stage: "staging" | "production") {
  const environmentalVariableKeys = {} as IEnvConfigExtra;

  Object.keys(envConfig).forEach((key) => {
    environmentalVariableKeys[key] = key;
  });

  const path01 = getFullPathFromRoot(`.${stage}.env`);
  const parsedEnv = dotenv.parse(fs.readFileSync(path01)) as unknown as IEnvConfigExtra;

  // console.log({ parsedEnv });

  return Promise.resolve({ parsedEnv, environmentalVariableKeys });
}
