import { GenericFriendlyError } from "../utils/errors.js";
import { LoggingService } from "./logging-service.js";
import { UtilService } from "./util-service.js";
import { HttpRequestBase } from "./http-request-base.js";

const performanceReportFinal: Record<string, number | undefined> = {};

class HttpServiceBase extends HttpRequestBase {
  private performanceStart() {
    const id = UtilService.getUUID();
    performanceReportFinal[id] = Date.now();
    return id;
  }

  private performanceEnd(id: string) {
    try {
      if (!id) {
        return undefined;
      }
      const value = performanceReportFinal[id];
      if (value !== undefined) {
        const result = Date.now() - value;
        try {
          delete performanceReportFinal[id];
        } catch (error) {
          //
        }
        return result;
      }
    } catch (error) {
      //
    }
    return undefined;
  }

  private performanceEnd_ToString(id: string) {
    const perf = this.performanceEnd(id);
    if (perf === undefined) {
      return undefined;
    }
    return perf.toString().padStart(6, "0");
  }

  async post<T>({
    url,
    data,
    params,
    form,
    headers,
    enableCache,
    cacheExpireInMinutes,
  }: {
    url: string;
    data: any;
    params?: Record<string, any>;
    form?: Record<string, any>;
    headers?: string[][];
    enableCache?: boolean;
    cacheExpireInMinutes?: number;
  }) {
    let performanceID: string = "";

    try {
      // if (enableCache === true) {
      //   const cachedData = await HttpCallCacheService.getValue_postPut<T>({
      //     bodyRequest: data,
      //     url,
      //     params: optionsData.params,
      //   });
      //   if (cachedData) {
      //     LoggingService.info({ cachedData_postPut: cachedData, dataCacheAccessAt: new Date().toISOString() });
      //     return cachedData;
      //   }
      // }

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
      const result01 = (await response.json()) as T;

      if (!response.ok) {
        this.createThrowError(result01);
      }

      const HTTP_PERFORMANCE_MS = this.performanceEnd_ToString(performanceID);

      // if (enableCache === true && result01) {
      //   await HttpCallCacheService.setValue_postPut({
      //     url,
      //     params: optionsData.params,
      //     value: result01,
      //     bodyRequest: data,
      //     expireInMinutes: cacheExpireInMinutes,
      //   });
      //   LoggingService.info({ dataCache_postPutSetAt: new Date().toISOString() });
      // }

      LoggingService.info({
        HTTP_TASK: "Success for POST endpoint".toUpperCase(),
        HTTP_PERFORMANCE_MS,
        url,
        params,
      });

      return result01;
    } catch (error) {
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

  async put<T>({
    url,
    data,
    form,
    params,
    headers,
  }: {
    url: string;
    data: any;
    params?: Record<string, any>;
    form?: Record<string, any>;
    headers?: string[][];
  }) {
    let performanceID: string = "";
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

      const result01: T = (await response.json()) as T;

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
    } catch (error) {
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

  async get<T>({
    url,
    params,
    headers,
    enableCache,
    cacheExpireInMinutes,
  }: {
    url: string;
    params?: Record<string, any>;
    headers?: string[][] | null;
    enableCache?: boolean;
    cacheExpireInMinutes?: number;
  }) {
    let performanceID: string = "";
    try {
      // if (enableCache === true) {
      //   const cachedData = await HttpCallCacheService.getValue<T>({ url, params: optionsData.params });
      //   if (cachedData) {
      //     LoggingService.info({ cachedData, dataCacheAccessAt: new Date().toISOString() });
      //     return cachedData;
      //   }
      // }

      LoggingService.info({ HTTP_TASK: "Calling GET endpoint".toUpperCase(), url, params });

      performanceID = this.performanceStart();

      const { response, requestData } = await this.request({
        method: "GET",
        url,
        headers,
        params,
      });

      const result01: T = (await response.json()) as T;

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

      // if (enableCache === true) {
      //   if (result01 && (typeof result01 === "object" || Array.isArray(result01))) {
      //     await HttpCallCacheService.setValue({
      //       url,
      //       params: optionsData.params,
      //       value: result01,
      //       expireInMinutes: cacheExpireInMinutes,
      //     });
      //     LoggingService.info({ dataCacheSetAt: new Date().toISOString() });
      //   }
      // }
      return result01;
    } catch (error) {
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

  private createThrowError(error: any) {
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
