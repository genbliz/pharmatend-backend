import { UtilService } from "@/services/util-service.js";
import { DateService } from "@/services/date-service.js";
import { GenericFriendlyError } from "../utils/errors.js";
import { StatusCode } from "../helper/status-code.js";
import { GetFriendlyErrorMessage } from "../helper/response-model.js";
import { envConfig } from "../config/env.js";
export class BaseHelperUtils {
    validateRequiredString(keyValueValidates) {
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!(value && typeof value === "string")) {
                errors.push(`${key} is required`);
            }
        });
        if (errors.length) {
            throw this.createFriendlyError(`${errors.join("; ")}.`);
        }
    }
    validateDateDiff({ fromDate, toDate, daysLimit }) {
        if (fromDate && toDate) {
            if (DateService.getDateDiffDays({ date1: fromDate, date2: toDate }) > daysLimit) {
                throw this.createFriendlyError(`Date range MUST be within ${daysLimit} days range`);
            }
        }
    }
    getEnvironments() {
        return {
            isProduction: envConfig.NODE_ENV === "production",
            isStaging: envConfig.NODE_ENV === "staging",
            isDevelopment: envConfig.NODE_ENV === "development",
            isTest: envConfig.NODE_ENV === "test",
        };
    }
    validateRequiredDate(keyValueValidates) {
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!(value && typeof value === "string")) {
                errors.push(`${key} is required`);
            }
            if (!(value && DateService.isDate(value))) {
                errors.push(`${key} must be valid date`);
            }
        });
        if (errors.length) {
            throw this.createFriendlyError(`${errors.join("; ")}.`);
        }
    }
    createFriendlyError(message) {
        return new GenericFriendlyError(message);
    }
    createFriendlyValidationError(message) {
        return new GenericFriendlyError(message, StatusCode.Validation_Error_422);
    }
    getFriendlyErrorMessage(err) {
        if (err && err instanceof GenericFriendlyError) {
            return err.message;
        }
        return null;
    }
    validateRequiredUUID(keyValueValidates) {
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!(value && UtilService.isUUID(`${value || ""}`))) {
                errors.push(`${key} have no valid uuid value`);
            }
        });
        if (errors.length) {
            throw this.createFriendlyError(`${errors.join("; ")}.`);
        }
    }
    validateRequiredEmail(keyValueValidates) {
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!(value && UtilService.isValidEmail(`${value || ""}`))) {
                errors.push(`${key} must be valid email`);
            }
        });
        if (errors.length) {
            throw this.createFriendlyError(`${errors.join("; ")}.`);
        }
    }
    validateRequiredNumber(keyValueValidates) {
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            const isValid = typeof value !== "undefined" && value !== null && !isNaN(Number(value)) && typeof value === "number";
            if (!isValid) {
                errors.push(`${key} must be valid number`);
            }
        });
        if (errors.length) {
            throw this.createFriendlyError(`${errors.join("; ")}.`);
        }
    }
    validateRequired_FromYear_ToYear({ fromYear, toYear, }) {
        this.validateYear_YYYY({ fromYear, toYear });
        if (fromYear && toYear) {
            if (Number(fromYear) > Number(toYear)) {
                throw this.createFriendlyError(`toYear must be greater than or equal to fromYear`);
            }
        }
    }
    validateYear_YYYY(keyValueValidates) {
        if (typeof keyValueValidates !== "object") {
            throw this.createFriendlyError("Invalid object value");
        }
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!DateService.isValidFormat_YYYY_MM_DD(`${value}-01-01`)) {
                errors.push(`${key} must be valid year format: YYYY`);
            }
        });
        if (errors.length) {
            throw this.createFriendlyError(`${errors.join("; ")}.`);
        }
    }
    validateFormat_MM_DD(keyValueValidates) {
        if (typeof keyValueValidates !== "object") {
            throw this.createFriendlyError("Invalid object value");
        }
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!DateService.isValidFormat_YYYY_MM_DD(`2022-${value}`)) {
                errors.push(`${key} must be valid year format: MM-DD`);
            }
        });
        if (errors.length) {
            throw this.createFriendlyError(`${errors.join("; ")}.`);
        }
    }
    validateDayStamp_YYYY_MM_DD(keyValueValidates) {
        if (typeof keyValueValidates !== "object") {
            throw this.createFriendlyError("Invalid object value");
        }
        const errors = [];
        Object.entries(keyValueValidates).forEach(([key, value]) => {
            if (!DateService.isValidFormat_YYYY_MM_DD(`${value || ""}`)) {
                errors.push(`${key} must be valid date format: YYYY-MM-DD`);
            }
        });
        if (errors.length) {
            throw this.createFriendlyError(`${errors.join("; ")}.`);
        }
    }
    helper_ValidateDataEditLock({ sessionUser, createdAtDate, }) {
        if (sessionUser?.isAdmin) {
            return Promise.resolve(true);
        }
        if (createdAtDate && DateService.isDate(createdAtDate) && sessionUser?.dataEditLockPeriodInMunite) {
            const expireAt = DateService.addMinutes({
                date: createdAtDate,
                minutes: sessionUser.dataEditLockPeriodInMunite,
            });
            const now = new Date();
            if (now.getTime() > expireAt.getTime()) {
                throw this.helper_CreateFriendlyError(`Data locked: allowed edit period has passed. Contact admin.`);
            }
            const nowDate = DateService.new_YYYY_MM_DD();
            const addedDate = DateService.extractIsoDateTo_YYYY_MM_DD(new Date(createdAtDate).toISOString());
            const isNotSameDay = nowDate !== addedDate;
            if (isNotSameDay) {
                throw this.helper_CreateFriendlyError(`Data locked: allowed edit day has passed. Contact admin.`);
            }
        }
        return Promise.resolve(true);
    }
    helper_CreateFriendlyError(message, httpStatus) {
        return GenericFriendlyError.create(message, httpStatus);
    }
    helper_GetFriendlyErrorMessage(err) {
        return GetFriendlyErrorMessage(err);
    }
}
//# sourceMappingURL=base-error-helper-utils.js.map