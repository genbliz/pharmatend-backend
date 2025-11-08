import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { GenericFriendlyError } from "@/utils/errors.js";
import { envConfig } from "@/config/env.js";

const commonConfigData = {
  USER_LOGINS_DATA_RETENTION_PERIOD_IN_MUNITES: 60 * 24 * 3,
  STREAM_LOGS_DATA_RETENTION_PERIOD_IN_MUNITES: 60 * 24 * 3,
  DATA_CACHE_PERIOD_IN_MUNITES: 60 * 24 * 7,
  DATA_LOCK_PERIOD_IN_MUNITES: 10,
};

export const CommonConfig = (() => {
  if (!envConfig?.NODE_ENV) {
    throw GenericFriendlyError.create("Environment variables NODE_ENV, not initialized");
  }

  const sqliteDbFolderPath = path.resolve([os.homedir(), ".tend-pos"].join("/"));

  if (!fs.existsSync(sqliteDbFolderPath)) {
    fs.mkdirSync(sqliteDbFolderPath, { recursive: true });
  }

  const SQLITE_DB_FILE_PATH = path.resolve(sqliteDbFolderPath, "sale_pay_point_db.db");

  return Object.freeze({
    ...commonConfigData,
    SQLITE_DB_FILE_PATH,
    // PARENT_SERVER_SMS_POST_URL: "",
    PARENT_SERVER_LOGIN_URL: "",
  });
})();
