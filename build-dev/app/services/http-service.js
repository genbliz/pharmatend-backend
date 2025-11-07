import { GenericFriendlyError } from "../utils/errors.js";
import { LoggingService } from "./logging-service.js";
import { UtilService } from "./util-service.js";
import { HttpRequestBase } from "./http-request-base.js";
const performanceReportFinal = {};
class HttpServiceBase extends HttpRequestBase {
    performanceStart() {
        const id = UtilService.getUUID();
        performanceReportFinal[id] = Date.now();
        return id;
    }
    performanceEnd(id) {
        try {
            if (!id) {
                return undefined;
            }
            const value = performanceReportFinal[id];
            if (value !== undefined) {
                const result = Date.now() - value;
                try {
                    delete performanceReportFinal[id];
                }
                catch (error) {
                }
                return result;
            }
        }
        catch (error) {
        }
        return undefined;
    }
    performanceEnd_ToString(id) {
        const perf = this.performanceEnd(id);
        if (perf === undefined) {
            return undefined;
        }
        return perf.toString().padStart(6, "0");
    }
    async post({ url, data, params, form, headers, enableCache, cacheExpireInMinutes, }) {
        let performanceID = "";
        try {
            LoggingService.info({ HTTP_TASK: "Calling POST endpoint".toUpperCase(), url, params });
            performanceID = this.performanceStart();
            const { response } = await this.request({
                method: "POST",
                headers,
                data,
                url,
                form,
                params,
            });
            const result01 = (await response.json());
            if (!response.ok) {
                this.createThrowError(result01);
            }
            const HTTP_PERFORMANCE_MS = this.performanceEnd_ToString(performanceID);
            LoggingService.info({
                HTTP_TASK: "Success for POST endpoint".toUpperCase(),
                HTTP_PERFORMANCE_MS,
                url,
                params,
            });
            return result01;
        }
        catch (error) {
            const HTTP_PERFORMANCE_MS = this.performanceEnd_ToString(performanceID);
            LoggingService.info({
                HTTP_ERROR_TASK: "Error Calling POST endpoint".toUpperCase(),
                HTTP_PERFORMANCE_MS,
                url,
                params,
            });
            throw error;
        }
    }
    async put({ url, data, form, params, headers, }) {
        let performanceID = "";
        try {
            LoggingService.info({ HTTP_TASK: "Calling PUT endpoint".toUpperCase(), url, params });
            performanceID = this.performanceStart();
            const { response } = await this.request({
                method: "PUT",
                headers,
                data,
                url,
                form,
                params,
            });
            const result01 = (await response.json());
            if (!response.ok) {
                this.createThrowError(result01);
            }
            const HTTP_PERFORMANCE_MS = this.performanceEnd_ToString(performanceID);
            LoggingService.info({
                HTTP_TASK: "Success for PUT endpoint".toUpperCase(),
                HTTP_PERFORMANCE_MS,
                url,
                params,
            });
            return result01;
        }
        catch (error) {
            const HTTP_PERFORMANCE_MS = this.performanceEnd_ToString(performanceID);
            LoggingService.info({
                HTTP_ERROR_TASK: "Error Calling PUT endpoint".toUpperCase(),
                HTTP_PERFORMANCE_MS,
                url,
                params,
            });
            throw error;
        }
    }
    async get({ url, params, headers, enableCache, cacheExpireInMinutes, }) {
        let performanceID = "";
        try {
            LoggingService.info({ HTTP_TASK: "Calling GET endpoint".toUpperCase(), url, params });
            performanceID = this.performanceStart();
            const { response, requestData } = await this.request({
                method: "GET",
                url,
                headers,
                params,
            });
            const result01 = (await response.json());
            if (!response.ok) {
                this.createThrowError(result01);
            }
            const HTTP_PERFORMANCE_MS = this.performanceEnd_ToString(performanceID);
            LoggingService.info({
                HTTP_TASK: "Success for GET endpoint".toUpperCase(),
                HTTP_PERFORMANCE_MS,
                url,
                params,
                fullUrl: requestData.fullUrl,
            });
            return result01;
        }
        catch (error) {
            const HTTP_PERFORMANCE_MS = this.performanceEnd_ToString(performanceID);
            LoggingService.info({
                HTTP_ERROR_TASK: "Error Calling GET endpoint".toUpperCase(),
                HTTP_PERFORMANCE_MS,
                url,
                params,
            });
            throw error;
        }
    }
    createThrowError(error) {
        LoggingService.error(error);
        if (error?.isHospimanAdmin && error?.message) {
            throw GenericFriendlyError.create(error.message);
        }
        if (error?.message && typeof error.message === "string") {
            throw GenericFriendlyError.create(error.message);
        }
        throw error;
    }
}
export const HttpService = new HttpServiceBase();
//# sourceMappingURL=http-service.js.map