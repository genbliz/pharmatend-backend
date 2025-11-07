import bunyan from "bunyan";
import { envConfig } from "@/config/env.js";
const streams = [];
const name = `HOSPIMAN-BACKEND-V2-${envConfig.NODE_ENV || ""}`.toUpperCase();
if (envConfig.NODE_ENV === "production") {
    streams.push({
        stream: process.stdout,
        level: "debug",
    });
}
else {
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
    info(msg, ...params) {
        if (params?.length) {
            logger.info(msg, params);
        }
        else {
            logger.info(msg);
        }
    }
    log(msg, ...params) {
        if (params?.length) {
            logger.info(msg, params);
        }
        else {
            logger.info(msg);
        }
    }
    logConsoleError(error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        logger.error(error);
    }
    anyError(error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        logger.error(error);
    }
    warning(error) {
        if (error instanceof Error) {
            logger.warn(error.message);
        }
        logger.warn(error);
    }
    logConsoleNative(msgs) {
        logger.info(msgs);
    }
    logConsoleInfo(msg) {
        logger.info(msg);
    }
    error(msg, ...params) {
        if (params?.length) {
            logger.error(msg, params);
        }
        else {
            logger.error(msg);
        }
    }
    anyInfo(msgs) {
        logger.info(msgs);
    }
}
export const LoggingService = new LoggingServiceBase();
//# sourceMappingURL=logging-service.js.map