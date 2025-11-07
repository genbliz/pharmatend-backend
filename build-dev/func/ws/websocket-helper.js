import { LoggingService } from "@/services/logging-service.js";
import { StatusCode } from "@/helpers/response-status-codes.js";
const currentConnection = new Map();
let MY_CACHE_ENABLED = false;
export const ConnectionCacheHelper = {
    async setCacheConnection({ connectionId, data }) {
        try {
            if (connectionId && data && MY_CACHE_ENABLED) {
                currentConnection.set(connectionId, JSON.stringify(data));
            }
            return await Promise.resolve();
        }
        catch (error) {
            LoggingService.anyError(error);
            return await Promise.resolve();
        }
    },
    setCacheStatus(enabled) {
        MY_CACHE_ENABLED = enabled === true;
    },
    async getCacheConnection({ connectionId }) {
        try {
            if (connectionId && MY_CACHE_ENABLED) {
                const result = currentConnection.get(connectionId);
                if (result) {
                    return JSON.parse(result);
                }
            }
            return await Promise.resolve(null);
        }
        catch (error) {
            LoggingService.anyError(error);
            return await Promise.resolve(null);
        }
    },
    async deleteCacheConnection({ connectionId }) {
        try {
            if (connectionId && MY_CACHE_ENABLED) {
                currentConnection.delete(connectionId);
                return await Promise.resolve(true);
            }
            return await Promise.resolve(false);
        }
        catch (error) {
            LoggingService.anyError(error);
            return await Promise.resolve(false);
        }
    },
};
export function successfullResponse({ statusCode, body } = {}) {
    const statusCode01 = statusCode && typeof statusCode === "number" && statusCode >= 200 && statusCode < 300 ? statusCode : StatusCode.OK_200;
    return {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*",
        },
        statusCode: statusCode01,
        body: body && typeof body === "string" ? body : "Ok",
    };
}
export function failureResponse({ statusCode, body }) {
    const statusCode01 = statusCode && typeof statusCode === "number" && statusCode >= 300 ? statusCode : StatusCode.InternalServerError_500;
    return {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*",
        },
        statusCode: statusCode01,
        body: body && typeof body === "string" ? body : "Failed",
    };
}
export function formatChatRequestData(body) {
    let socketBodyRaw = {};
    if (body) {
        if (typeof body === "string") {
            try {
                socketBodyRaw = JSON.parse(body);
            }
            catch (err) {
                LoggingService.anyError(err);
            }
        }
        else if (typeof body === "object") {
            try {
                socketBodyRaw = body;
            }
            catch (err) {
                LoggingService.anyError(err);
            }
        }
    }
    if (socketBodyRaw?.action) {
        if (socketBodyRaw?.data?.msgTypeKind !== undefined) {
            return socketBodyRaw.data;
        }
    }
    return {};
}
//# sourceMappingURL=websocket-helper.js.map