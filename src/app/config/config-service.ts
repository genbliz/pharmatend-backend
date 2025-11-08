import os from "node:os";
import { UtilService } from "@/services/util-service.js";

export const ConfigService = {
  RemoteServerHeaderKeys: {
    authorization: "Authorization",
  },
  LOCAL_ENV_FILE_PATH: UtilService.getFullPathFromRoot(`${os.tmpdir()}/.pay-point/.env`),
  LOCAL_ENV_FILE_PATH_JSON: UtilService.getFullPathFromRoot(`${os.tmpdir()}/.pay-point/env.json`),
};
