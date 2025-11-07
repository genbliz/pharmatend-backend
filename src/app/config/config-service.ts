import os from "node:os";
import { UtilService } from "@/services/util-service.js";

export const ConfigService = {
  ClientHeadersKeys: {
    tenantId: "HOSPIMAN_HEADERS_TENANT_ID",
    authToken: "HOSPIMAN_HEADERS_AUTH_TOKEN",
    userId: "HOSPIMAN_HEADERS_USER_ID",
    appVersion: "HOSPIMAN_HEADERS_APP_VERION",
  },
  RemoteServerHeaderKeys: {
    tenantId: "HOSPIMAN_REMOTE_TENANT_ID",
    authorization: "Authorization",
    userId: "HOSPIMAN_REMOTE_USER_ID",
  },
  LOCAL_ENV_FILE_PATH: UtilService.getFullPathFromRoot(`${os.tmpdir()}/.pay-point/.env`),
  LOCAL_ENV_FILE_PATH_JSON: UtilService.getFullPathFromRoot(`${os.tmpdir()}/.pay-point/env.json`),
};
