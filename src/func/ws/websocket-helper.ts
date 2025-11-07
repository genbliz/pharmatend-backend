import { APIGatewayProxyResult } from "aws-lambda";
import { IMessageSocketBody } from "@/common/chat/chat-types.js";
import { LoggingService } from "@/services/logging-service.js";
import { StatusCode } from "@/helpers/response-status-codes.js";

export interface ISocketRespInfo {
  statusCode?: StatusCode;
  body?: string;
}

const currentConnection = new Map<string, string>();

let MY_CACHE_ENABLED = false;

export const ConnectionCacheHelper = {
  async setCacheConnection({ connectionId, data }: { connectionId: string; data: Record<string, any> | Record<string, any>[] }) {
    try {
      if (connectionId && data && MY_CACHE_ENABLED) {
        currentConnection.set(connectionId, JSON.stringify(data));
      }
      return await Promise.resolve();
    } catch (error) {
      LoggingService.anyError(error);
      return await Promise.resolve();
    }
  },

  setCacheStatus(enabled: boolean) {
    MY_CACHE_ENABLED = enabled === true;
  },

  async getCacheConnection<T = any>({ connectionId }: { connectionId: string }) {
    try {
      if (connectionId && MY_CACHE_ENABLED) {
        const result = currentConnection.get(connectionId);
        if (result) {
          return JSON.parse(result) as T;
        }
      }
      return await Promise.resolve(null);
    } catch (error) {
      LoggingService.anyError(error);
      return await Promise.resolve(null);
    }
  },

  async deleteCacheConnection({ connectionId }: { connectionId: string }) {
    try {
      if (connectionId && MY_CACHE_ENABLED) {
        currentConnection.delete(connectionId);
        return await Promise.resolve(true);
      }
      return await Promise.resolve(false);
    } catch (error) {
      LoggingService.anyError(error);
      return await Promise.resolve(false);
    }
  },
} as const;

export function successfullResponse({ statusCode, body }: ISocketRespInfo = {}): APIGatewayProxyResult {
  const statusCode01 =
    statusCode && typeof statusCode === "number" && statusCode >= 200 && statusCode < 300 ? statusCode : StatusCode.OK_200;
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

export function failureResponse({ statusCode, body }: ISocketRespInfo): APIGatewayProxyResult {
  const statusCode01 =
    statusCode && typeof statusCode === "number" && statusCode >= 300 ? statusCode : StatusCode.InternalServerError_500;
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

export function formatChatRequestData<T>(body: unknown): IMessageSocketBody<T> {
  type IReg = {
    action: string;
    data?: IMessageSocketBody;
  };

  let socketBodyRaw = {} as IReg;

  if (body) {
    if (typeof body === "string") {
      try {
        socketBodyRaw = JSON.parse(body);
      } catch (err) {
        LoggingService.anyError(err);
      }
    } else if (typeof body === "object") {
      try {
        socketBodyRaw = body as any;
      } catch (err) {
        LoggingService.anyError(err);
      }
    }
  }
  if (socketBodyRaw?.action) {
    if (socketBodyRaw?.data?.msgTypeKind !== undefined) {
      return socketBodyRaw.data;
    }
  }
  return {} as IMessageSocketBody<T>;
}
