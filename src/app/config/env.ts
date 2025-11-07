import dotenv from "dotenv";
import fs from "node:fs";
import { expand } from "dotenv-expand";
import { ConfigService } from "@/config/config-service.js";
const myEnv = dotenv.config();
expand(myEnv);
//
const envGlobCache: { [x: string]: string | undefined } = {};
const envLoadedCache: { [x: string]: boolean | undefined } = {};

function isLambdaEnvironment() {
  if (
    process.env._HANDLER &&
    process.env.LAMBDA_RUNTIME_DIR &&
    process.env.LAMBDA_TASK_ROOT &&
    process.env.AWS_LAMBDA_FUNCTION_NAME
  ) {
    return true;
  }
  return false;
}

/**
 * cache value, its faster!
 *
 * @param {string} envKey
 * @returns
 */
function getEnv(envKey: string) {
  if (envGlobCache[envKey] !== undefined) {
    return envGlobCache[envKey];
  }
  const envVal = process.env[envKey];
  if (envVal !== undefined) {
    envGlobCache[envKey] = envVal;
    return envVal;
  }

  if (!envLoadedCache["loadedOnce"]) {
    envLoadedCache["loadedOnce"] = true;
    if (!isLambdaEnvironment() && !Object.keys(envGlobCache).length) {
      //
      const envPath = ConfigService.LOCAL_ENV_FILE_PATH;
      //
      if (fs.existsSync(envPath)) {
        try {
          const content = fs.readFileSync(envPath, { encoding: "utf8" });

          const out = dotenv.parse(content);
          const envList = Object.entries(out || {});

          if (envList?.length) {
            envList.forEach(([key, val]) => {
              if (val && key) envGlobCache[key] = val;
            });
          }

          if (envGlobCache[envKey] !== undefined) {
            return envGlobCache[envKey];
          }
        } catch (error) {
          //
        }
      } else {
        const envPathJson = ConfigService.LOCAL_ENV_FILE_PATH_JSON;
        if (fs.existsSync(envPathJson)) {
          try {
            const content = fs.readFileSync(envPathJson, { encoding: "utf8" });

            const out = JSON.parse(content);

            const envList: [string, any][] = Object.entries(out || {});

            if (envList?.length) {
              envList.forEach(([key, val]) => {
                if (val && key) envGlobCache[key] = String(val);
              });
            }

            if (envGlobCache[envKey] !== undefined) {
              return envGlobCache[envKey];
            }
          } catch (error) {
            //
          }
        }
      }
    }
  }
  return undefined;
}

function getEnvString(envKey: string) {
  const val = getEnv(envKey);
  if (val) {
    return val;
  }
  return "";
}

function getEnvBool(envKey: string) {
  const val = getEnv(envKey);
  if (val !== undefined && String(val).trim() === "true") {
    return true;
  }
  return false;
}

function getEnvNumber(envKey: string, defaultVal?: number) {
  const val = getEnv(envKey);
  if (val !== undefined && !isNaN(Number(val))) {
    return Number(val);
  }
  return defaultVal as number;
}

type IDeployTypes = "LOCAL" | "SERVERLESS";

type IEnvironment = "production" | "staging" | "development" | "test";

export const envConfig = {
  NODE_ENV: getEnvString("NODE_ENV") as IEnvironment,
  //
  APP_PORT: getEnvNumber("APP_PORT"),
  APP_SERVER_TIMEOUT: getEnvNumber("APP_SERVER_TIMEOUT"),
  APP_SERVER_JWT_SECRET: getEnvString("APP_SERVER_JWT_SECRET"),
  APP_SERVER_LOGIN_EXPIRATION_IN_SECONDS: getEnvNumber("APP_SERVER_LOGIN_EXPIRATION_IN_SECONDS"),
  APP_SERVER_BASE_URL: getEnvString("APP_SERVER_BASE_URL"),
  //
  APP_SITE_PORT: getEnvNumber("APP_SITE_PORT"),
  APP_LOCAL_SOCKET_PORT: getEnvNumber("APP_LOCAL_SOCKET_PORT"),
  //
  APP_AWS_ACCESS_KEY_ID: getEnvString("APP_AWS_ACCESS_KEY_ID"),
  APP_AWS_SECRET_ACCESS_KEY: getEnvString("APP_AWS_SECRET_ACCESS_KEY"),
  APP_AWS_REGION: getEnvString("APP_AWS_REGION"),
  APP_AWS_ACCOUNT_ID: getEnvString("APP_AWS_ACCOUNT_ID"),
  //
  APP_AWS_S3_UPLOAD_BUCKET_NAME: getEnvString("APP_AWS_S3_UPLOAD_BUCKET_NAME"),
  //
  CAN_ENABLE_S3_FILE_STORAGE: getEnvBool("CAN_ENABLE_S3_FILE_STORAGE"),
  APP_DEPLOY_KIND: getEnvString("APP_DEPLOY_KIND") as IDeployTypes,
  //
  HOSPIMAN_MANAGEMANT_ACCESS_KEY: getEnvString("HOSPIMAN_MANAGEMANT_ACCESS_KEY"),
  HOSPIMAN_BACKEND_ACCESS_KEY: getEnvString("HOSPIMAN_BACKEND_ACCESS_KEY"),
  HOSPIMAN_ASSETS_CDN_URL: getEnvString("HOSPIMAN_ASSETS_CDN_URL"),
  //
  OFFLINE_LOCAL_APP_COMMUNICATION_URL: getEnvString("OFFLINE_LOCAL_APP_COMMUNICATION_URL"),
  LOCAL_SERVER_LICENSED_TENANT_ID: getEnvString("LOCAL_SERVER_LICENSED_TENANT_ID"),
  LOCAL_SERVER_LICENSED_TENANT_SHORT_CODE: getEnvNumber("LOCAL_SERVER_LICENSED_TENANT_SHORT_CODE"),
  LOCAL_SERVER_COUCH_DB_PROXY_AUTHORIZATION_ENC_TOKEN: getEnvString(
    "LOCAL_SERVER_COUCH_DB_PROXY_AUTHORIZATION_ENC_TOKEN",
  ),
  //
  REPLICATION_ENABLED: getEnvBool("REPLICATION_ENABLED"),
  //
  COUCH_DB_HOST: getEnvString("COUCH_DB_HOST"),
  COUCH_DB_PORT: getEnvNumber("COUCH_DB_PORT"),
  COUCH_DB_USER: getEnvString("COUCH_DB_USER"),
  COUCH_DB_PASS: getEnvString("COUCH_DB_PASS"),
  COUCH_DB_NAME: getEnvString("COUCH_DB_NAME"),
  COUCH_DB_SERVER_SECRET: getEnvString("COUCH_DB_SERVER_SECRET"),
  //
  APP_DOMAIN_BASE_NAME: getEnvString("APP_DOMAIN_BASE_NAME"),
  APP_DOMAIN_BASE_NAME_WEBSOCKET: getEnvString("APP_DOMAIN_BASE_NAME_WEBSOCKET"),
  //
  APP_VAR_WEBSOCKET_DOMAIN_AND_PATH: getEnvString("APP_VAR_WEBSOCKET_DOMAIN_AND_PATH"),
  APP_VAR_AWS_ACCOUNT_ID: getEnvString("APP_VAR_AWS_ACCOUNT_ID"),
  APP_VAR_QUEUE_RECIEVER_NAME: getEnvString("APP_VAR_QUEUE_RECIEVER_NAME"),
};

export const lambdaDefinedEnvConfig = {
  _HANDLER: getEnvString("_HANDLER"),
  AWS_REGION: getEnvString("AWS_REGION"),
  AWS_EXECUTION_ENV: getEnvString("AWS_EXECUTION_ENV"),
  AWS_LAMBDA_FUNCTION_NAME: getEnvString("AWS_LAMBDA_FUNCTION_NAME"),
  AWS_LAMBDA_FUNCTION_MEMORY_SIZE: getEnvNumber("AWS_LAMBDA_FUNCTION_MEMORY_SIZE"),
  AWS_LAMBDA_RUNTIME_API: getEnvString("AWS_LAMBDA_RUNTIME_API"),
  AWS_LAMBDA_FUNCTION_VERSION: getEnvString("AWS_LAMBDA_FUNCTION_VERSION"),
  AWS_LAMBDA_INITIALIZATION_TYPE: getEnvString("AWS_LAMBDA_INITIALIZATION_TYPE"),
  LAMBDA_RUNTIME_DIR: getEnvString("LAMBDA_RUNTIME_DIR"),
  LAMBDA_TASK_ROOT: getEnvString("LAMBDA_TASK_ROOT"),
  LD_LIBRARY_PATH: getEnvString("LD_LIBRARY_PATH"),
  NODE_PATH: getEnvString("NODE_PATH"),
  TZ: getEnvString("TZ"),
  NODE_VERSION: process.version,
};

if (envConfig.NODE_ENV === "development") {
  console.log({ envConfig });
}

export type IEnvConfig = typeof envConfig;

export function getAWSCredentialCollection() {
  if (envConfig.APP_AWS_ACCESS_KEY_ID && envConfig.APP_AWS_SECRET_ACCESS_KEY) {
    return {
      region: envConfig.APP_AWS_REGION,
      credentials: {
        accountId: envConfig.APP_AWS_ACCOUNT_ID || undefined,
        accessKeyId: envConfig.APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: envConfig.APP_AWS_SECRET_ACCESS_KEY,
      },
    };
  }
  return {
    region: envConfig.APP_AWS_REGION,
  };
}
