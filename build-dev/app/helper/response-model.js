import { LoggingService } from "@/services/logging-service.js";
import { isMessageInResponseMessageList } from "./response-message.js";
import { StatusCode } from "./status-code.js";
import { GenericFriendlyError } from "@/utils/errors.js";
import { MocodyGenericError } from "mocody";
function getErrorMessage({ errorMsg, message } = {}) {
    let msgOrError = "";
    if (errorMsg instanceof GenericFriendlyError) {
        return errorMsg.message.trim();
    }
    if (errorMsg instanceof MocodyGenericError) {
        return errorMsg.message.trim();
    }
    let _errorMsg;
    if (errorMsg instanceof Error) {
        _errorMsg = errorMsg.message;
    }
    else {
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
    responseModel({ success, message, data, debug }) {
        return {
            success,
            status: success ? "success" : "error",
            message: message || null,
            data: data || null,
            isHospiman: true,
            debug: debug || undefined,
        };
    }
    success({ message, data }) {
        const msg = getErrorMessage({ errorMsg: null, message });
        return this.responseModel({
            success: true,
            message: msg,
            data,
        });
    }
    resSuccess(res, { message, data }) {
        const _res = this.success({ message, data });
        res.status(StatusCode.OK_200).json(_res);
    }
    errorResolve({ error, message }) {
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
        let errorMsg01;
        if (error instanceof Error) {
            errorMsg01 = error.message;
        }
        else {
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
    error(option) {
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
    resError(res, statusCode, option) {
        const res01 = this.error(option);
        res.status(statusCode).json(res01);
    }
}
export const ResponseModelResolve = new ResponseModelServiceBase();
export function CreateFriendlyError(message, httpStatus = StatusCode.BadRequest_400) {
    return new GenericFriendlyError(message, httpStatus);
}
export function GetFriendlyErrorMessage(err) {
    return getErrorMessage({ errorMsg: err });
}
//# sourceMappingURL=response-model.js.map