import { UtilService } from "@/services/util-service.js";
import { DateService } from "@/services/date-service.js";
import { ISessionUser } from "../account/auth/auth-types.js";
import { GenericFriendlyError } from "../utils/errors.js";
import { StatusCode } from "../helper/status-code.js";
import { GetFriendlyErrorMessage } from "../helper/response-model.js";
import { envConfig } from "../config/env.js";

export class BaseHelperUtils {
  validateRequiredString(keyValueValidates: { [key: string]: string | null | undefined }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && typeof value === "string")) {
        errors.push(`${key} is required`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  validateDateDiff({ fromDate, toDate, daysLimit }: { fromDate: string; toDate: string; daysLimit: number }) {
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

  validateRequiredDate(keyValueValidates: { [key: string]: string }) {
    const errors: string[] = [];
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

  createFriendlyError(message: string) {
    return new GenericFriendlyError(message);
  }

  createFriendlyValidationError(message: string) {
    return new GenericFriendlyError(message, StatusCode.Validation_Error_422);
  }

  getFriendlyErrorMessage(err: unknown): string | null {
    if (err && err instanceof GenericFriendlyError) {
      return err.message;
    }
    return null;
  }

  validateRequiredUUID(keyValueValidates: { [key: string]: string }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && UtilService.isUUID(`${value || ""}`))) {
        errors.push(`${key} have no valid uuid value`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  validateRequiredEmail(keyValueValidates: { [key: string]: string }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && UtilService.isValidEmail(`${value || ""}`))) {
        errors.push(`${key} must be valid email`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  validateRequiredNumber(keyValueValidates: { [key: string]: number | undefined | null }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      const isValid =
        typeof value !== "undefined" && value !== null && !isNaN(Number(value)) && typeof value === "number";
      if (!isValid) {
        errors.push(`${key} must be valid number`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  validateRequired_FromYear_ToYear({
    fromYear,
    toYear,
  }: {
    fromYear: number | undefined | null | string;
    toYear: number | undefined | null | string;
  }) {
    // this.validateRequiredNumber({ fromYear: Number(fromYear), toYear: Number(toYear) });
    this.validateYear_YYYY({ fromYear, toYear });
    if (fromYear && toYear) {
      if (Number(fromYear) > Number(toYear)) {
        throw this.createFriendlyError(`toYear must be greater than or equal to fromYear`);
      }
    }
  }

  validateYear_YYYY(keyValueValidates: Record<string, string | number | null | undefined>) {
    if (typeof keyValueValidates !== "object") {
      throw this.createFriendlyError("Invalid object value");
    }
    const errors: string[] = [];

    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!DateService.isValidFormat_YYYY_MM_DD(`${value}-01-01`)) {
        errors.push(`${key} must be valid year format: YYYY`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  validateFormat_MM_DD(keyValueValidates: Record<string, string | number | null | undefined>) {
    if (typeof keyValueValidates !== "object") {
      throw this.createFriendlyError("Invalid object value");
    }
    const errors: string[] = [];

    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!DateService.isValidFormat_YYYY_MM_DD(`2022-${value}`)) {
        errors.push(`${key} must be valid year format: MM-DD`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  validateDayStamp_YYYY_MM_DD(keyValueValidates: Record<string, string | null | undefined>) {
    if (typeof keyValueValidates !== "object") {
      throw this.createFriendlyError("Invalid object value");
    }
    const errors: string[] = [];

    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!DateService.isValidFormat_YYYY_MM_DD(`${value || ""}`)) {
        errors.push(`${key} must be valid date format: YYYY-MM-DD`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  helper_ValidateDataEditLock({
    sessionUser,
    createdAtDate,
  }: {
    sessionUser: ISessionUser;
    createdAtDate?: Date | string | null;
  }) {
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

  protected helper_CreateFriendlyError(message: string, httpStatus?: StatusCode) {
    return GenericFriendlyError.create(message, httpStatus);
  }

  protected helper_GetFriendlyErrorMessage(err: any): string | null {
    return GetFriendlyErrorMessage(err);
  }
}
