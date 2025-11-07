import lodash from "lodash";
import { BaseHelperUtils } from "./base-error-helper-utils.js";
import { AuthSessionHelperService } from "@/account/auth/auth-session-helper-service.js";
import { DefinedUserPermission } from "@/account/authorization/authorization-permission.js";
import { DateService } from "@/services/date-service.js";
import { SchemaValidatorService } from "../services/schema-validator-service.js";
import { LoggingService } from "../services/logging-service.js";
import { GenericFriendlyError } from "../utils/errors.js";
import { StatusCode } from "../helper/status-code.js";
import { ResponseMessage } from "../helper/response-message.js";
import { ResponseModelResolve } from "../helper/response-model.js";
class BaseControllerBase extends BaseHelperUtils {
    DefinedRequiredPermission = { ...DefinedUserPermission };
    ResponseMessages = { ...ResponseMessage };
    DEFAULT_PAGE_SIZE = 20;
    async joiSchemaValidate({ schemaDef, data, }) {
        const { validatedData } = await SchemaValidatorService.joiSchemaValidate({
            schemaDef,
            data: data,
            canThrowTheError: true,
        });
        return validatedData;
    }
    async checkValidateHasPermission({ req, requiredAnyPermission, }) {
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
    async getCurrentUserClaims({ req }) {
        const sessionData = await AuthSessionHelperService.getRequireSessionUserData({ req });
        const userClaims = await AuthSessionHelperService.getCurrentUserClaims({ req });
        return {
            user: sessionData,
            claims: userClaims,
        };
    }
    async hasRole({ req, pathRoles, userRoles, }) {
        const currentUserData = await this.getCurrentUserClaims({ req });
        const user = currentUserData.user;
        const isHasRole = this.hasRoleBase({
            pathRoles,
            user,
            userRoles,
        });
        return Promise.resolve(isHasRole);
    }
    hasRoleBase({ pathRoles, user, userRoles, }) {
        if (user?.isAdmin === true) {
            return true;
        }
        if (!pathRoles?.length) {
            return true;
        }
        if (!userRoles) {
            return false;
        }
        const pathRoles01 = [];
        pathRoles.forEach((role01) => {
            if (typeof role01 === "string") {
                pathRoles01.push(role01);
            }
            else {
                pathRoles01.push(role01.name);
            }
        });
        const pathRolesArray = ((pathRoles01 || []).join(",") || "").toLowerCase().split(",");
        const userRolesArray = ((userRoles || []).join(",") || "").toLowerCase().split(",");
        if (pathRolesArray?.length && userRolesArray?.length) {
            const matchCount = lodash.intersection(userRolesArray, pathRolesArray);
            if (matchCount?.length) {
                return true;
            }
        }
        return false;
    }
    async getSessionUserInfo({ req, withAnyPermission, }) {
        if (withAnyPermission?.length) {
            await this.checkValidateHasPermission({
                req,
                requiredAnyPermission: withAnyPermission,
            });
        }
        return AuthSessionHelperService.getRequireSessionUserData({ req });
    }
    async validateUserLoginAndAuthenticated({ req, withAnyPermission, }) {
        if (withAnyPermission?.length) {
            await this.checkValidateHasPermission({
                req,
                requiredAnyPermission: withAnyPermission,
            });
        }
        await AuthSessionHelperService.getRequireSessionUserData({ req });
    }
    async validateAdminOnlyAccess({ req }) {
        const sessionData = await AuthSessionHelperService.getRequireSessionUserData({ req });
        if (!sessionData?.isAdmin) {
            throw this.helper_CreateFriendlyError(ResponseMessage.onlyAdminRoleAllowed);
        }
        return AuthSessionHelperService.getRequireSessionUserData({ req });
    }
    isNewData(data) {
        if (!data?.id && !data?._id) {
            return true;
        }
        return false;
    }
    resolveSortValue(val) {
        const type1 = val === "asc" || val === "ascending" || val === 1 ? "asc" : null;
        const type2 = val === "desc" || val === "descending" || val === -1 ? "desc" : null;
        return type1 || type2;
    }
    async getUserClaims(req) {
        const claims = await AuthSessionHelperService.getCurrentUserClaims({ req });
        if (claims?.length) {
            return claims;
        }
        return Promise.resolve(null);
    }
    getNumberValue(param) {
        if (param !== undefined && param !== null) {
            if (typeof param === "string" || typeof param === "number") {
                if (!isNaN(Number(param))) {
                    return Number(param);
                }
            }
        }
        return null;
    }
    getBooleanValue(val) {
        if (val !== undefined && val !== null) {
            if (typeof val === "string" || typeof val === "boolean") {
                if (String(val).trim() === "true" || String(val).trim() === "false") {
                    try {
                        return JSON.parse(`${val}`.trim()) === true;
                    }
                    catch (error) {
                    }
                }
            }
        }
        return null;
    }
    validateParameterNumberValue(keyValueValidates) {
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!(!isNaN(Number(value)) && typeof value === "number")) {
                errors.push(`${key} parameter is required and MUST be a number`);
            }
        });
        if (errors.length) {
            throw GenericFriendlyError.createValidationError(`${errors.join("; ")}.`);
        }
    }
    validateParameterStringValue(keyValueValidates) {
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!(value && typeof value === "string" && value.length)) {
                errors.push(`${key} parameter is required and MUST be a string value`);
            }
            else if (value.startsWith(":") && value === `:${key}`) {
                errors.push(`${key} parameter is required, invalid parameter value`);
            }
        });
        if (errors.length) {
            throw GenericFriendlyError.createValidationError(`${errors.join("; ")}.`);
        }
    }
    validateIsoDateValue(keyValueValidates) {
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!(value && typeof value === "string" && value.length)) {
                errors.push(`${key} parameter is required and MUST be iso date value`);
            }
            else if (value.startsWith(":") && value === `:${key}`) {
                errors.push(`${key} parameter is required; invalid parameter value`);
            }
        });
        if (errors.length) {
            throw GenericFriendlyError.createValidationError(`${errors.join("; ")}.`);
        }
    }
    validateRequiredDayStamp_YYYY_MM_DD(keyValueValidates) {
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!DateService.isValidFormat_YYYY_MM_DD(value)) {
                errors.push(`${key} is required and must be valid date format: YYYY-MM-DD`);
            }
        });
        if (errors.length) {
            throw GenericFriendlyError.createValidationError(`${errors.join("; ")}.`);
        }
    }
    createFriendlyError(message) {
        return this.helper_CreateFriendlyError(message);
    }
    createValidationError(message) {
        return this.helper_CreateFriendlyError(message, StatusCode.Validation_Error_422);
    }
    validateDataEditLock({ sessionUser, createdAtDate, }) {
        return this.helper_ValidateDataEditLock({ sessionUser, createdAtDate });
    }
    getFriendlyErrorMessage(message) {
        return this.helper_GetFriendlyErrorMessage(message);
    }
    parseOnlyNumberQuery(query) {
        const returnData = {};
        const reqData = query || {};
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
    parseOnlyBooleanQuery(query) {
        const returnData = {};
        const reqData = query || {};
        Object.entries(reqData).forEach(([key, val]) => {
            if (key) {
                const mVal = this.getBooleanValue(val);
                if (mVal !== null) {
                    returnData[key] = mVal;
                }
            }
        });
        return returnData;
    }
    parseStringQueryT(query) {
        const returnData = {};
        const reqData = query || {};
        Object.entries(reqData).forEach(([key, val]) => {
            if (key) {
                returnData[key] = val;
            }
        });
        return returnData;
    }
    parseStringQuery(query) {
        const returnData = {};
        const reqData = query || {};
        Object.entries(reqData).forEach(([key, val]) => {
            if (key) {
                returnData[key] = val;
            }
        });
        return returnData;
    }
    orderBy(dataList, fn, sort = "asc") {
        if (!dataList?.length) {
            return dataList;
        }
        const sort01 = this.resolveSortValue(sort) ?? "asc";
        return lodash.orderBy(dataList, fn, sort01);
    }
    limitResult(dataList, count) {
        if (!dataList?.length) {
            return dataList;
        }
        return dataList.slice(0, count);
    }
    resError({ res, message, error, httpStatus = StatusCode.BadRequest_400, }) {
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
    resSuccess({ res, data, message = null, httpStatus = StatusCode.OK_200, }) {
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
    successPlain({ res, data, httpStatus = StatusCode.OK_200, }) {
        return res.status(httpStatus).send(data);
    }
    successDownloadJson({ res, data, httpStatus = 200, downloadTitle, }) {
        const dataRes = typeof data === "string" ? data : JSON.stringify(data);
        const myFileName = downloadTitle ? `${downloadTitle}-${Date.now()}` : `${Date.now()}`;
        res.setHeader("Content-disposition", `attachment; filename=${myFileName}.json`);
        res.setHeader("Content-type", "application/json");
        return res.status(httpStatus).send(dataRes);
    }
    successPdf({ res, base64Data, httpStatus = 200, downloadTitle, }) {
        res.setHeader("Content-Type", "application/pdf");
        if (downloadTitle) {
            res.setHeader("Content-disposition", `attachment;filename=${downloadTitle}.pdf`);
        }
        res.setHeader("Content-Length", Buffer.byteLength(base64Data, "base64"));
        return res.status(httpStatus).send(base64Data);
    }
    successBufferPdf({ res, buffData, httpStatus = 200, downloadTitle, }) {
        res.setHeader("Content-Type", "application/pdf");
        if (downloadTitle) {
            res.setHeader("Content-disposition", `attachment;filename=${downloadTitle}.pdf`);
        }
        res.setHeader("Content-Length", Buffer.byteLength(buffData));
        return res.status(httpStatus).send(buffData);
    }
    successBufferPng({ res, buffData, httpStatus = 200 }) {
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Content-Length", Buffer.byteLength(buffData));
        return res.status(httpStatus).send(buffData);
    }
    resSuccessPaging({ res, message = null, result, httpStatus = StatusCode.OK_200, }) {
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
    resSuccessAdvanced({ res, message = null, result, httpStatus = StatusCode.OK_200, }) {
        if (result && "paginationResults" in result) {
            return this.resSuccessPaging({
                res,
                message,
                result: result,
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
//# sourceMappingURL=base-controller.js.map