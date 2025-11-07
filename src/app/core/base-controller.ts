import lodash from "lodash";
import Joi from "joi";
import { Response, Request } from "express";
import { BaseErrorHelperUtils } from "@/core/base-error-helper-utils.js";
import { AuthSessionHelperService } from "@/account/auth/auth-session-helper-service.js";
import { DefinedUserPermission, IPermissionItem } from "@/account/authorization/authorization-permission.js";
import { ICoreRequestParams, IDataSortKey } from "@/core/base-types.js";
import { DateService } from "@/services/date-service.js";
import { SchemaValidatorService } from "@/services/schema-validator-service.js";
import { LoggingService } from "@/services/logging-service.js";
import { GenericFriendlyError } from "@/utils/errors.js";
import { ISessionUser } from "@/account/auth/auth-types.js";
import { StatusCode } from "@/helper/status-code.js";
import { ResponseMessage } from "@/helper/response-message.js";
import { ResponseModelResolve } from "@/helper/response-model.js";

class BaseControllerBase extends BaseErrorHelperUtils {
  readonly DefinedRequiredPermission = { ...DefinedUserPermission } as const;
  readonly ResponseMessages = { ...ResponseMessage } as const;
  readonly DEFAULT_PAGE_SIZE = 20;

  async joiSchemaValidate<T = Record<string, any>>({
    schemaDef,
    data,
  }: {
    schemaDef: Joi.PartialSchemaMap<any>;
    data: T;
  }) {
    const { validatedData } = await SchemaValidatorService.joiSchemaValidate({
      schemaDef,
      data: data as Record<string, any>,
      canThrowTheError: true,
    });
    return validatedData as T;
  }

  async checkValidateHasPermission({
    req,
    requiredAnyPermission,
  }: {
    req: Request;
    requiredAnyPermission: IPermissionItem[];
  }) {
    const userSession = await AuthSessionHelperService.getRequireSessionUserData({ req });
    if (userSession?.userClaims?.length) {
      const hasPermission = await this.hasRole({
        req,
        pathRoles: requiredAnyPermission,
        userRoles: userSession.userClaims,
      });
      if (hasPermission) {
        return true;
      }
    }
    throw GenericFriendlyError.createForbiddenError("User do not have previledge of access");
  }

  private async getCurrentUserClaims({ req }: { req: Request }) {
    const sessionData = await AuthSessionHelperService.getRequireSessionUserData({ req });
    const userClaims: string[] = await AuthSessionHelperService.getCurrentUserClaims({ req });
    return {
      user: sessionData,
      claims: userClaims,
    };
  }

  async hasRole({
    req,
    pathRoles,
    userRoles,
  }: {
    req: Request;
    pathRoles: IPermissionItem[];
    userRoles: string[];
  }): Promise<boolean> {
    const currentUserData = await this.getCurrentUserClaims({ req });

    const user: ISessionUser = currentUserData.user;

    const isHasRole = this.hasRoleBase({
      pathRoles,
      user,
      userRoles,
    });
    return Promise.resolve(isHasRole);
  }

  private hasRoleBase({
    pathRoles,
    user,
    userRoles,
  }: {
    pathRoles: IPermissionItem[];
    user: ISessionUser;
    userRoles: string[];
  }): boolean {
    //
    if (user?.isAdmin === true) {
      return true;
    }

    if (!pathRoles?.length) {
      return true;
    }

    if (!userRoles) {
      return false;
    }

    const pathRoles01: string[] = [];

    pathRoles.forEach((role01) => {
      if (typeof role01 === "string") {
        pathRoles01.push(role01);
      } else {
        pathRoles01.push(role01.name);
      }
    });

    const pathRolesArray: string[] = ((pathRoles01 || []).join(",") || "").toLowerCase().split(",");
    const userRolesArray: string[] = ((userRoles || []).join(",") || "").toLowerCase().split(",");

    if (pathRolesArray?.length && userRolesArray?.length) {
      const matchCount: string[] = lodash.intersection(userRolesArray, pathRolesArray);
      if (matchCount?.length) {
        return true;
      }
    }
    return false;
  }

  async getSessionUserInfo({
    req,
    withAnyPermission,
  }: {
    req: Request;
    withAnyPermission?: IPermissionItem[];
  }): Promise<ISessionUser> {
    if (withAnyPermission?.length) {
      await this.checkValidateHasPermission({
        req,
        requiredAnyPermission: withAnyPermission,
      });
    }
    return AuthSessionHelperService.getRequireSessionUserData({ req });
  }

  async validateUserLoginAndAuthenticated({
    req,
    withAnyPermission,
  }: {
    req: Request;
    withAnyPermission?: IPermissionItem[];
  }): Promise<void> {
    if (withAnyPermission?.length) {
      await this.checkValidateHasPermission({
        req,
        requiredAnyPermission: withAnyPermission,
      });
    }
    await AuthSessionHelperService.getRequireSessionUserData({ req });
  }

  async validateAdminOnlyAccess({ req }: { req: Request }) {
    const sessionData = await AuthSessionHelperService.getRequireSessionUserData({ req });
    if (!sessionData?.isAdmin) {
      throw this.helper_CreateFriendlyError(ResponseMessage.onlyAdminRoleAllowed);
    }
    return AuthSessionHelperService.getRequireSessionUserData({ req });
  }

  isNewData(data: Record<string, any>) {
    if (!data?.id && !data?._id) {
      return true;
    }
    return false;
  }

  resolveSortValue(val: "asc" | "desc" | "ascending" | "descending" | string | 1 | -1 | null | undefined) {
    const type1 = val === "asc" || val === "ascending" || val === 1 ? "asc" : null;
    const type2 = val === "desc" || val === "descending" || val === -1 ? "desc" : null;
    return type1 || type2;
  }

  async getUserClaims(req: Request) {
    const claims = await AuthSessionHelperService.getCurrentUserClaims({ req });
    if (claims?.length) {
      return claims;
    }
    return Promise.resolve(null);
  }

  getNumberValue(param: unknown): number | null {
    if (param !== undefined && param !== null) {
      if (typeof param === "string" || typeof param === "number") {
        if (!isNaN(Number(param))) {
          return Number(param);
        }
      }
    }
    return null;
  }

  getBooleanValue(val: unknown): boolean | null {
    if (val !== undefined && val !== null) {
      if (typeof val === "string" || typeof val === "boolean") {
        if (String(val).trim() === "true" || String(val).trim() === "false") {
          try {
            return JSON.parse(`${val}`.trim()) === true;
          } catch (error) {
            //
          }
        }
      }
    }
    return null;
  }

  validateParameterNumberValue(keyValueValidates: { [key: string]: number | undefined | null }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(!isNaN(Number(value)) && typeof value === "number")) {
        errors.push(`${key} parameter is required and MUST be a number`);
      }
    });
    if (errors.length) {
      throw GenericFriendlyError.createValidationError(`${errors.join("; ")}.`);
    }
  }

  validateParameterStringValue(keyValueValidates: { [key: string]: string | null | undefined }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && typeof value === "string" && value.length)) {
        errors.push(`${key} parameter is required and MUST be a string value`);
        //
      } else if (value.startsWith(":") && value === `:${key}`) {
        errors.push(`${key} parameter is required, invalid parameter value`);
      }
    });
    if (errors.length) {
      throw GenericFriendlyError.createValidationError(`${errors.join("; ")}.`);
    }
  }

  validateIsoDateValue(keyValueValidates: { [key: string]: unknown }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && typeof value === "string" && value.length)) {
        errors.push(`${key} parameter is required and MUST be iso date value`);
        //
      } else if (value.startsWith(":") && value === `:${key}`) {
        errors.push(`${key} parameter is required; invalid parameter value`);
      }
    });
    if (errors.length) {
      throw GenericFriendlyError.createValidationError(`${errors.join("; ")}.`);
    }
  }

  validateRequiredDayStamp_YYYY_MM_DD(keyValueValidates: { [key: string]: string }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!DateService.isValidFormat_YYYY_MM_DD(value)) {
        errors.push(`${key} is required and must be valid date format: YYYY-MM-DD`);
      }
    });
    if (errors.length) {
      throw GenericFriendlyError.createValidationError(`${errors.join("; ")}.`);
    }
  }

  createFriendlyError(message: string) {
    return this.helper_CreateFriendlyError(message);
  }

  createValidationError(message: string) {
    return this.helper_CreateFriendlyError(message, StatusCode.Validation_Error_422);
  }

  validateDataEditLock({
    sessionUser,
    createdAtDate,
  }: {
    sessionUser: ISessionUser;
    createdAtDate?: Date | string | null;
  }) {
    return this.helper_ValidateDataEditLock({ sessionUser, createdAtDate });
  }

  getFriendlyErrorMessage(message: string) {
    return this.helper_GetFriendlyErrorMessage(message);
  }

  // eslint-disable-next-line no-undef
  parseOnlyNumberQuery(query: qs.ParsedQs) {
    const returnData: Record<string, number> = {} as any;
    const reqData: any = query || {};
    Object.entries(reqData).forEach(([key, val]) => {
      if (key) {
        const mVal = this.getNumberValue(val);
        if (mVal !== null) {
          returnData[key] = mVal;
        }
      }
    });
    return returnData;
  }

  parseOnlyBooleanQuery<T = Record<string, boolean>>(query: qs.ParsedQs) {
    const returnData: any = {};
    const reqData: any = query || {};
    Object.entries(reqData).forEach(([key, val]) => {
      if (key) {
        const mVal = this.getBooleanValue(val);
        if (mVal !== null) {
          returnData[key] = mVal;
        }
      }
    });
    return returnData as T;
  }

  parseStringQueryT<T>(query: qs.ParsedQs) {
    const returnData: any = {};
    const reqData: any = query || {};
    Object.entries(reqData).forEach(([key, val]) => {
      if (key) {
        returnData[key] = val as string;
      }
    });
    return returnData as Record<keyof (T & ICoreRequestParams), string>;
  }

  parseStringQuery(query: qs.ParsedQs) {
    const returnData: Record<string, string> = {} as any;
    const reqData: any = query || {};
    Object.entries(reqData).forEach(([key, val]) => {
      if (key) {
        returnData[key] = val as string;
      }
    });
    return returnData;
  }

  orderBy<T>(dataList: T[], fn: (dt: T) => string | number | undefined, sort: IDataSortKey | string = "asc") {
    if (!dataList?.length) {
      return dataList;
    }
    const sort01 = this.resolveSortValue(sort) ?? "asc";
    return lodash.orderBy(dataList, fn, sort01);
  }

  limitResult<T>(dataList: T[], count: number) {
    if (!dataList?.length) {
      return dataList;
    }
    return dataList.slice(0, count);
  }

  resError({
    res,
    message,
    error,
    httpStatus = StatusCode.BadRequest_400,
  }: {
    res: Response;
    message?: string;
    error?: string | Error | unknown;
    httpStatus?: StatusCode;
  }) {
    if (error) {
      LoggingService.anyError(error);
    }

    if (message) {
      LoggingService.anyError(message);
    }

    if (message && typeof message === "string") {
      const errorRes = ResponseModelResolve.responseModel({
        message: message,
        success: false,
      });
      return res.status(httpStatus).json(errorRes);
    }
    const errorData01 = ResponseModelResolve.errorResolve({
      error,
      message: message ?? ResponseMessage.internalServerError,
    });
    return res.status(errorData01.httpStatus || httpStatus).json(errorData01.response);
  }

  resSuccess({
    res,
    data,
    message = null,
    httpStatus = StatusCode.OK_200,
  }: {
    res: Response;
    data: any;
    message?: string | null;
    httpStatus?: StatusCode;
  }) {
    const successRes = {
      success: true,
      message,
      data,
      code: httpStatus,
      status: "success",
      isHospiman: true,
    };
    return res.status(httpStatus).json(successRes);
  }

  successPlain({
    //
    res,
    data,
    httpStatus = StatusCode.OK_200,
  }: {
    res: Response;
    data: any;
    httpStatus?: number;
  }) {
    return res.status(httpStatus).send(data);
  }

  successDownloadJson({
    res,
    data,
    httpStatus = 200,
    downloadTitle,
  }: {
    res: Response;
    data: any;
    downloadTitle?: string;
    httpStatus?: number;
  }) {
    const dataRes = typeof data === "string" ? data : JSON.stringify(data);
    const myFileName = downloadTitle ? `${downloadTitle}-${Date.now()}` : `${Date.now()}`;
    res.setHeader("Content-disposition", `attachment; filename=${myFileName}.json`);
    res.setHeader("Content-type", "application/json");
    return res.status(httpStatus).send(dataRes);
  }

  successPdf({
    res,
    base64Data,
    httpStatus = 200,
    downloadTitle,
  }: {
    res: Response;
    base64Data: string;
    downloadTitle?: string;
    httpStatus?: number;
  }) {
    res.setHeader("Content-Type", "application/pdf");
    if (downloadTitle) {
      res.setHeader("Content-disposition", `attachment;filename=${downloadTitle}.pdf`);
    }
    res.setHeader("Content-Length", Buffer.byteLength(base64Data, "base64"));
    return res.status(httpStatus).send(base64Data);
  }

  successBufferPdf({
    res,
    buffData,
    httpStatus = 200,
    downloadTitle,
  }: {
    res: Response;
    buffData: Buffer;
    httpStatus?: number;
    downloadTitle?: string;
  }) {
    res.setHeader("Content-Type", "application/pdf");
    if (downloadTitle) {
      res.setHeader("Content-disposition", `attachment;filename=${downloadTitle}.pdf`);
    }
    res.setHeader("Content-Length", Buffer.byteLength(buffData));
    return res.status(httpStatus).send(buffData);
  }

  successBufferPng({ res, buffData, httpStatus = 200 }: { res: Response; buffData: Buffer; httpStatus?: number }) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", Buffer.byteLength(buffData));
    return res.status(httpStatus).send(buffData);
  }

  /*************** */

  resSuccessPaging({
    res,
    message = null,
    result,
    httpStatus = StatusCode.OK_200,
  }: {
    res: Response;
    message?: string | null;
    httpStatus?: StatusCode;
    result: {
      paginationResults: any;
      nextPageHash: string | undefined | null;
    };
  }) {
    const successRes = {
      success: true,
      message,
      data: result?.paginationResults,
      code: httpStatus,
      status: "success",
      nextPageHash: result?.nextPageHash,
      isHospiman: true,
    };
    return res.status(httpStatus).json(successRes);
  }

  resSuccessAdvanced({
    res,
    message = null,
    result,
    httpStatus = StatusCode.OK_200,
  }: {
    res: Response;
    message?: string | null;
    httpStatus?: StatusCode;
    result:
      | Record<string, any>[]
      | Record<string, any>
      | {
          paginationResults: any[];
          nextPageHash: string | undefined;
        };
  }) {
    if (result && "paginationResults" in result) {
      return this.resSuccessPaging({
        res,
        message,
        result: result as any,
        httpStatus,
      });
    }
    return this.resSuccess({
      res,
      message,
      data: result,
      httpStatus,
    });
  }
}

export const BaseController = new BaseControllerBase();
