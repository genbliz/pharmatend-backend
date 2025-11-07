import fs from "node:fs";
import { randomUUID } from "node:crypto";
import bunyan from "bunyan";
import { envConfig } from "@/config/env.js";

const streams: bunyan.Stream[] = [];
const name = `PHARMATEND-V2-${envConfig.NODE_ENV || ""}`.toUpperCase();

if (envConfig.NODE_ENV === "production") {
  streams.push({
    stream: process.stdout,
    level: "debug",
  });
} else {
  streams.push({
    stream: process.stdout,
    level: "debug",
  });
}

const logger = bunyan.createLogger({
  name,
  streams,
  serializers: bunyan.stdSerializers,
});

class LoggingServiceBase {
  info(info: unknown, ...params: unknown[]) {
    if (params?.length) {
      logger.info(info, params);
    } else {
      logger.info(info);
    }
  }

  log(message: unknown, ...params: any[]) {
    if (params?.length) {
      logger.info(message, params);
    } else {
      logger.info(message);
    }
  }

  logConsoleError(error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    logger.error(error);
  }

  anyError(error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    logger.error(error);
  }

  anyErrorId(id: string) {
    return (error: unknown) => {
      let idValue = id ? (id.startsWith("@") ? id : `@${id}`) : "";

      if (idValue) {
        if (!idValue.trim().endsWith(":")) {
          idValue = `${idValue}::: `;
        }
      }

      if (error instanceof Error) {
        logger.error(idValue + error.message);
      }
      logger.error(error);
    };
  }

  warning(error: unknown) {
    if (error instanceof Error) {
      logger.warn(error.message);
    }
    logger.warn(error);
  }

  logConsoleNative(msgs: unknown) {
    logger.info(msgs);
  }

  logConsoleInfo(info: unknown) {
    logger.info(info);
  }

  logInfoAndToFile(info: unknown) {
    logger.info(info);
    this.logToJsonFile(info);
  }

  logToJsonFile(infoObj: unknown) {
    if (envConfig.NODE_ENV === "development" && infoObj && typeof infoObj === "object") {
      try {
        const fPath = [
          new Date().toISOString().split(":").join("_").split(".").join("_"),
          randomUUID().split("-")[0],
        ].join("__");
        fs.promises.writeFile(`.logs/log_temp__${fPath}.json`, JSON.stringify(infoObj, null, 2)).catch(() => {
          /* */
        });
      } catch (error) {
        logger.error(error);
      }
    }
  }

  error(error: unknown, ...params: any[]) {
    if (params?.length) {
      logger.error(error, params);
    } else {
      logger.error(error);
    }
  }

  anyInfo(info: unknown) {
    logger.info(info);
  }
}

export const LoggingService = new LoggingServiceBase();
