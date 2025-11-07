import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { GenericFriendlyError } from "../utils/errors.js";
import { envConfig } from "./env.js";

/** static-asset.hospiman.com */
const static_asset_hospiman_com = "https://d3k85evsryhpso.cloudfront.net";

const commonConfigData = {
  USER_LOGINS_DATA_RETENTION_PERIOD_IN_MUNITES: 60 * 24 * 3,
  STREAM_LOGS_DATA_RETENTION_PERIOD_IN_MUNITES: 60 * 24 * 3,
  DATA_CACHE_PERIOD_IN_MUNITES: 60 * 24 * 7,
  DATA_LOCK_PERIOD_IN_MUNITES: 10,
  //
  STATIC_JSON_DATA_URL__LIST_OF_NHIS_IN_NIGERIA: `${static_asset_hospiman_com}/list-of-nhis-in-nigeria.json`,
  STATIC_JSON_DATA_URL__FDA_DRUG_LIST: `${static_asset_hospiman_com}/fda-drug-list-v2.json`,
  STATIC_JSON_DATA_URL__NHIS_DRUG_LIST: `${static_asset_hospiman_com}/nhis-drug-list-v2.json`,
  STATIC_JSON_DATA_URL__NAFDAC_DRUG_LIST: `${static_asset_hospiman_com}/nafdac-drug-list-v2.json`,
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

  const HOSPIMAN_ADMIN_BASE_URL: string =
    envConfig.NODE_ENV === "production" ? "https://api-prod.hospimanapps.com" : "https://api-staging.hospimanapps.com";

  return Object.freeze({
    ...commonConfigData,
    SQLITE_DB_FILE_PATH,
    PARENT_SERVER_SMS_POST_URL: `${HOSPIMAN_ADMIN_BASE_URL}/hospiman-admin/main/v2/remote/remote-sms-post`,
    PARENT_SERVER_LOGIN_URL: `${HOSPIMAN_ADMIN_BASE_URL}/hospiman-admin/main/v2/remote/remote-login`,
    PARENT_SERVER_GET_PATIENT_INFO_URL: `${HOSPIMAN_ADMIN_BASE_URL}/hospiman-admin/main/v2/remote/remote-get-tenant-info`,
    PARENT_SERVER_GET_CHAT_TOKEN: `${HOSPIMAN_ADMIN_BASE_URL}/hospiman-admin/main/v2/remote/remote-chat-token`,
  });
})();
