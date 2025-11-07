import { LoggingService } from "@/services/logging-service.js";
import { isMessageInResponseMessageList } from "./response-message.js";
import express from "express";
import { StatusCode } from "./status-code.js";
import { GenericFriendlyError } from "@/utils/errors.js";
import { MocodyGenericError } from "mocody";

interface ISuccessResponseModelResolve {
  message?: string | null;
  data: any;
}

function getErrorMessage({ errorMsg, message }: { errorMsg?: unknown; message?: any } = {}) {
  let msgOrError: string = "";

  if (errorMsg instanceof GenericFriendlyError) {
    return errorMsg.message.trim();
  }

  if (errorMsg instanceof MocodyGenericError) {
    return errorMsg.message.trim();
  }

  let _errorMsg: unknown;
  if (errorMsg instanceof Error) {
    _errorMsg = errorMsg.message;
  } else {
    _errorMsg = errorMsg;
  }

  if (_errorMsg && typeof _errorMsg === "string") {
    if (isMessageInResponseMessageList(_errorMsg)) {
      msgOrError = _errorMsg;
    }
  }
  if (msgOrError === "" && message && typeof message === "string") {
    msgOrError = message;
  }
  return msgOrError.trim();
}

class ResponseModelServiceBase {
  responseModel({ success, message, data, debug }: { success: boolean; message?: string; data?: any; debug?: any }) {
    return {
      success,
      status: success ? "success" : "error",
      message: message || null,
      data: data || null,
      isHospiman: true,
      debug: debug || undefined,
    };
  }

  success({ message, data }: ISuccessResponseModelResolve) {
    const msg = getErrorMessage({ errorMsg: null, message });
    return this.responseModel({
      success: true,
      message: msg,
      data,
    });
  }

  resSuccess(res: express.Response, { message, data }: ISuccessResponseModelResolve): void {
    const _res = this.success({ message, data });
    res.status(StatusCode.OK_200).json(_res);
  }

  errorResolve({ error, message }: { error: unknown; message: string }) {
    if (error instanceof GenericFriendlyError) {
      return {
        httpStatus: error.httpStatus,
        response: this.responseModel({
          success: false,
          message: error.message,
          data: null,
        }),
      };
    }

    if (error instanceof MocodyGenericError) {
      return {
        httpStatus: null,
        response: this.responseModel({
          success: false,
          message: error.message,
          data: null,
        }),
      };
    }

    let errorMsg01: unknown;
    if (error instanceof Error) {
      errorMsg01 = error.message;
    } else {
      errorMsg01 = error;
    }

    if (errorMsg01 && typeof errorMsg01 === "string") {
      if (isMessageInResponseMessageList(errorMsg01)) {
        return {
          httpStatus: null,
          response: this.responseModel({
            success: false,
            message: errorMsg01 || message,
            data: null,
          }),
        };
      }
    }

    return {
      httpStatus: undefined,
      response: this.responseModel({
        success: false,
        message: message,
        data: null,
      }),
    };
  }

  error(option: { message: string; errorMsg?: any }) {
    const errMsg = getErrorMessage({ errorMsg: option.errorMsg, message: option.message });
    if (option && option.errorMsg) {
      LoggingService.log("********* ERROR TRACKER START *********");
      LoggingService.error(option.errorMsg);
      LoggingService.log("********* ERROR TRACKER END *********");
    }
    if (errMsg) {
      LoggingService.error(errMsg);
    }
    return this.responseModel({
      success: false,
      message: errMsg,
      data: null,
    });
  }

  resError(
    res: express.Response,
    statusCode: StatusCode,
    option: {
      message: string;
      errorMsg?: unknown;
    },
  ): void {
    const res01 = this.error(option);
    res.status(statusCode).json(res01);
  }
}

export const ResponseModelResolve = new ResponseModelServiceBase();

export function CreateFriendlyError(message: string, httpStatus: StatusCode = StatusCode.BadRequest_400) {
  return new GenericFriendlyError(message, httpStatus);
}

export function GetFriendlyErrorMessage(err: unknown): string | null {
  return getErrorMessage({ errorMsg: err });
}
