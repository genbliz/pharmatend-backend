import { StatusCode } from "../helper/status-code.js";

type IGenericResponseErrorParams = {
  error: string | Error;
  httpStatus?: number;
  code?: string | number;
  subject?: string;
};

function resolveErrorParams({
  errorOption,
  httpStatusX,
  codeX,
}: {
  errorOption: IGenericResponseErrorParams | string | Error;
  httpStatusX?: number;
  codeX?: string | number;
}) {
  let message: string = "Unknown Error";
  let httpStatus: number = httpStatusX || 500;
  let code: string | number = codeX || "E000";
  if (typeof errorOption === "string") {
    message = errorOption;
  } else if (errorOption instanceof Error) {
    message = errorOption.message;
  } else if (typeof errorOption === "object") {
    if (errorOption.error instanceof Error) {
      message = errorOption.error.message;
    } else if (typeof errorOption.error === "string") {
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
  readonly httpStatus: number;
  readonly code: string | number;

  constructor(
    errorOption: IGenericResponseErrorParams | string | Error,
    httpStatus?: StatusCode,
    code?: string | number,
  ) {
    super(resolveErrorParams({ errorOption }).message);
    const { httpStatus: status01, code: code01 } = resolveErrorParams({
      errorOption,
      httpStatusX: httpStatus,
      codeX: code,
    });
    this.httpStatus = status01;
    this.code = code01;
  }

  static fromError({ error, httpStatus, code }: IGenericResponseErrorParams) {
    return new GenericFriendlyError({ error, httpStatus, code });
  }

  static create(msg: string, httpStatus?: StatusCode) {
    return new GenericFriendlyError(msg, httpStatus);
  }

  static throwNew(msg: string, httpStatus?: StatusCode) {
    throw new GenericFriendlyError(msg, httpStatus);
  }

  static createUnAuthorizedError(msg: string) {
    return new GenericFriendlyError(msg, StatusCode.Unauthorized_401);
  }

  static createBadRequestError(msg: string) {
    return new GenericFriendlyError(msg, StatusCode.BadRequest_400);
  }

  static createForbiddenError(msg: string) {
    return new GenericFriendlyError(msg, StatusCode.Forbidden_403);
  }

  static createValidationError(msg: string) {
    return new GenericFriendlyError(msg, StatusCode.Validation_Error_422);
  }

  static createInternalServerError(msg: string) {
    return new GenericFriendlyError(msg, StatusCode.InternalServerError_500);
  }

  static createNotFoundError(msg: string) {
    return new GenericFriendlyError(msg, StatusCode.NotFound_404);
  }
}
