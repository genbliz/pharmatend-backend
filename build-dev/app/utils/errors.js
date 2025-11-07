import { StatusCode } from "../helper/status-code.js";
function resolveErrorParams({ errorOption, httpStatusX, codeX, }) {
    let message = "Unknown Error";
    let httpStatus = httpStatusX || 500;
    let code = codeX || "E000";
    if (typeof errorOption === "string") {
        message = errorOption;
    }
    else if (errorOption instanceof Error) {
        message = errorOption.message;
    }
    else if (typeof errorOption === "object") {
        if (errorOption.error instanceof Error) {
            message = errorOption.error.message;
        }
        else if (typeof errorOption.error === "string") {
            message = errorOption.error;
        }
        if (errorOption?.httpStatus) {
            httpStatus = errorOption?.httpStatus;
        }
        if (errorOption?.code) {
            code = errorOption?.code;
        }
        if (errorOption?.subject) {
            message = `${errorOption.subject}:: ${message}`;
        }
    }
    return { httpStatus, message, code };
}
export class GenericFriendlyError extends Error {
    httpStatus;
    code;
    constructor(errorOption, httpStatus, code) {
        super(resolveErrorParams({ errorOption }).message);
        const { httpStatus: status01, code: code01 } = resolveErrorParams({
            errorOption,
            httpStatusX: httpStatus,
            codeX: code,
        });
        this.httpStatus = status01;
        this.code = code01;
    }
    static fromError({ error, httpStatus, code }) {
        return new GenericFriendlyError({ error, httpStatus, code });
    }
    static create(msg, httpStatus) {
        return new GenericFriendlyError(msg, httpStatus);
    }
    static throwNew(msg, httpStatus) {
        throw new GenericFriendlyError(msg, httpStatus);
    }
    static createUnAuthorizedError(msg) {
        return new GenericFriendlyError(msg, StatusCode.Unauthorized_401);
    }
    static createBadRequestError(msg) {
        return new GenericFriendlyError(msg, StatusCode.BadRequest_400);
    }
    static createForbiddenError(msg) {
        return new GenericFriendlyError(msg, StatusCode.Forbidden_403);
    }
    static createValidationError(msg) {
        return new GenericFriendlyError(msg, StatusCode.Validation_Error_422);
    }
    static createInternalServerError(msg) {
        return new GenericFriendlyError(msg, StatusCode.InternalServerError_500);
    }
    static createNotFoundError(msg) {
        return new GenericFriendlyError(msg, StatusCode.NotFound_404);
    }
}
//# sourceMappingURL=errors.js.map