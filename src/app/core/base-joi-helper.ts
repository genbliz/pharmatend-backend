import Joi from "joi";
import { isValidPhoneNumber, findNumbers } from "libphonenumber-js";
import { UtilService } from "@/services/util-service.js";
import { DateService } from "../services/date-service.js";

export type ISchemaMap = Joi.SchemaMap;

export function getJoiValidationErrors(err: Joi.ValidationError): string | null {
  if (err?.details?.length) {
    const details = UtilService.convertObjectToJsonPlainObject(err.details);
    const joiData = details.map((x) => x.message.replace(new RegExp('"', "g"), ""));
    return joiData.join("; ");
  }
  return null;
}

const joi_phone_number = (phoneString: string, helpers: Joi.CustomHelpers) => {
  if (phoneString.startsWith("+") && isValidPhoneNumber(phoneString)) {
    const [numberFound] = findNumbers(phoneString, { v2: true });
    if (numberFound?.number?.country === "NG" && numberFound.number.nationalNumber.length !== 10) {
      throw new Error(`'${numberFound.number.number}' not valid a valid phone number length`);
    }
    return phoneString;
  }
  throw new Error(`'${helpers.original}' not valid a valid phone number`);
};

const joi_yyyy_mm_dd_base = (dateString: string, errorMsg: string) => {
  if (!(dateString && typeof dateString === "string")) {
    throw new Error(errorMsg);
  }
  const regEx = /^\d{4}-\d{2}-\d{2}$/;

  if (!regEx.test(dateString)) {
    // Invalid format
    throw new Error(errorMsg);
  }

  const pdate = dateString.split("-");
  if (pdate?.length !== 3) {
    throw new Error(errorMsg);
  }
  const [yyyy, mm, dd] = pdate.map((dt) => parseInt(dt));

  if (!(mm >= 1 && mm <= 12)) {
    throw new Error(errorMsg);
  }
  // Create list of days of a month [assume there is no leap year by default]
  const listOfDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const isNonLeapYearMonth = mm === 1 || mm > 2;

  if (isNonLeapYearMonth) {
    if (dd > listOfDays[mm - 1]) {
      throw new Error(errorMsg);
    }
  } else {
    let lyear = false;
    if ((!(yyyy % 4) && yyyy % 100) || !(yyyy % 400)) {
      lyear = true;
    }
    if (lyear === false && dd >= 29) {
      throw new Error(errorMsg);
    }
    if (lyear === true && dd > 29) {
      throw new Error(errorMsg);
    }
  }
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) {
    // NaN value, Invalid date
    throw new Error(errorMsg);
  }
  const check1 = d.toISOString().slice(0, 10) === dateString;
  const check2 = d.toISOString().split("T")[0] === dateString;
  if (!(check1 && check2)) {
    throw new Error(errorMsg);
  }
  // Return the value unchanged
  return dateString;
};

const joi_yyyy_mm_dd_method = (dateString: string, helpers: Joi.CustomHelpers) => {
  const errorMsg = `'${helpers.original}' not valid. Value must be a valid date format: YYYY-MM-DD`;
  return joi_yyyy_mm_dd_base(dateString, errorMsg);
};

const joi_yyyy_mm_method = (dateString: string, helpers: Joi.CustomHelpers) => {
  const errorMsg = `'${helpers.original}' not valid. Value must be valid date format: YYYY-MM`;
  const validated = joi_yyyy_mm_dd_base(`${dateString}-01`, errorMsg);
  if (validated) {
    // trick linter
  }
  return dateString;
};

const joi_mm_dd_method = (mmddDateString: string, helpers: Joi.CustomHelpers) => {
  const errorMsg = `'${helpers.original}' not valid. Value must be valid date format: MM-DD`;
  const validated = joi_yyyy_mm_dd_base(`2022-${mmddDateString}`, errorMsg);
  if (validated) {
    // trick linter
  }
  return mmddDateString;
};

const joi_email_method = (email: string, helpers: Joi.CustomHelpers) => {
  if (email) {
    const errorMsg = `'${helpers.original}' is not a valid email`;
    if (!UtilService.isValidEmail(email)) {
      throw new Error(errorMsg);
    }
  }
  return email;
};

const joi_yyyy_method = (dateString: string, helpers: Joi.CustomHelpers) => {
  const errorMsg = `'${helpers.original}' not valid. Value must be valid date format: YYYY`;
  const validated = joi_yyyy_mm_dd_base(`${dateString}-01-01`, errorMsg);
  if (validated) {
    // trick linter
  }
  return dateString;
};

const joi_orderId_yyyymmddmm_method = (orderString: string, helpers: Joi.CustomHelpers) => {
  const errorMsg = `'${helpers.original}' not valid order code`;

  if (!(orderString && orderString.length === 18)) {
    throw new Error(errorMsg);
  }

  const [orderString01, randomCode] = orderString.split("-");

  if (!(orderString01 && randomCode && orderString01.length === 12 && randomCode.length === 5)) {
    throw new Error(errorMsg);
  }

  const tomorrow = DateService.addDays({ date: new Date(), days: 1 });

  const year = Number(orderString01.slice(0, 4));
  const month = Number(orderString01.slice(4, 6));
  const day = Number(orderString01.slice(6, 8));
  const hour = Number(orderString01.slice(8, 10));
  const minute = Number(orderString01.slice(10));

  if (!(year && year >= 1900 && year <= tomorrow.getFullYear())) {
    throw new Error(errorMsg);
  }

  if (!(month && month >= 1 && month <= 12)) {
    throw new Error(errorMsg);
  }

  if (!(day && day >= 1 && day <= 31)) {
    throw new Error(errorMsg);
  }

  if (!(hour && hour >= 0 && hour <= 23)) {
    throw new Error(errorMsg);
  }

  if (!(minute && minute >= 0 && minute <= 59)) {
    throw new Error(errorMsg);
  }

  return orderString;
};

export function JoiDateISOValidation({
  isRequired,
  defaultVal,
  defaultNow,
  enforceFullIsoFormat,
}: {
  isRequired?: boolean;
  defaultNow?: boolean;
  enforceFullIsoFormat?: boolean;
  defaultVal?: () => string;
} = {}) {
  //
  if (enforceFullIsoFormat === true) {
    const isoFullDateFormatFunc = (str: string, helpers: Joi.CustomHelpers) => {
      const msg = `'${helpers.original}' not valid. Value must be valid date and full iso date format`;
      if (!(str && typeof str === "string")) {
        throw new Error(msg);
      }
      if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) {
        throw new Error(msg);
      }
      const d = new Date(str);
      const isValid = d?.toISOString() === str;
      if (!isValid) {
        throw new Error(msg);
      }
      return str;
    };

    const joiInst = Joi.string().empty("").custom(isoFullDateFormatFunc, "Full iso date");

    if (isRequired === true) {
      return joiInst.required().strict(false);
    }
    if (defaultVal) {
      return joiInst.default(defaultVal).strict(false);
    }

    if (defaultNow === true) {
      return joiInst.default(() => new Date().toISOString());
    }
    return joiInst;
  }
  const joiInst = Joi.string().isoDate();

  if (isRequired === true) {
    return joiInst.required();
  }
  if (defaultVal) {
    return joiInst.default(defaultVal);
  }
  if (defaultNow === true) {
    return joiInst.default(() => new Date().toISOString());
  }
  return joiInst;
}

export function JoiIsoTimeFormat_HH_MM({
  isRequired,
  defaultNow,
}: { isRequired?: boolean; defaultNow?: boolean } = {}) {
  //
  const isoTimeFormatFunc = (hh_mm: string, helpers: Joi.CustomHelpers) => {
    const msg = `'${helpers.original}' not valid. Value must be valid iso time and format: HH:MM`;
    if (!(hh_mm && typeof hh_mm === "string")) {
      throw new Error(msg);
    }
    if (!/\d{2}:\d{2}/.test(hh_mm)) {
      throw new Error(msg);
    }

    const [hh, mm] = hh_mm.split(":").map((f, _, arr) => {
      if (arr.length !== 2) {
        throw new Error(msg);
      }
      return Number(f);
    });

    if (!(hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59)) {
      throw new Error(msg);
    }

    const joinedDate = `2021-01-01T${hh_mm}:00.000Z`;
    const d = new Date(joinedDate);
    const isValid = d?.toISOString() === joinedDate;
    if (!isValid) {
      throw new Error(msg);
    }
    return hh_mm;
  };

  const joiInst = Joi.string().empty("").custom(isoTimeFormatFunc, "iso time").strict(false);

  if (isRequired === true) {
    return joiInst.required();
  }

  if (defaultNow === true) {
    return joiInst.default(() => {
      const [hh, mm] = new Date().toISOString().split("T")[1].split(":");
      return [hh, mm].join(":");
    });
  }
  return joiInst;
}

export function JoiDateFormat_YYYY_MM_DD({
  isRequired,
  useTodayAsDefault,
}: { isRequired?: boolean; useTodayAsDefault?: boolean } = {}) {
  let joiInst = Joi.string().empty("").custom(joi_yyyy_mm_dd_method, "custom YYYY-MM-DD validation");

  if (useTodayAsDefault === true) {
    joiInst = joiInst.default(() => {
      return new Date().toISOString().split("T")[0];
    });
  }
  if (isRequired === true) {
    return joiInst.required();
  }
  return [JoiStripWhenNull(), joiInst] as [Joi.AnySchema<any>, Joi.StringSchema<string>];
}

export function JoiDateFormat_YYYY_MM({ isRequired }: { isRequired?: boolean } = {}) {
  const joiInst = Joi.string().custom(joi_yyyy_mm_method, "custom YYYY-MM validation");
  if (isRequired === true) {
    return joiInst.required();
  }
  return joiInst;
}

export function JoiDateFormat_MM_DD({ isRequired }: { isRequired?: boolean } = {}) {
  const joiInst = Joi.string().custom(joi_mm_dd_method, "custom MM-DD validation");
  if (isRequired === true) {
    return joiInst.required();
  }
  return joiInst;
}

export function JoiOrderIdCode({ isRequired }: { isRequired?: boolean } = {}) {
  const joiInst = Joi.string().custom(joi_orderId_yyyymmddmm_method, "order code validation");
  if (isRequired === true) {
    return joiInst.required();
  }
  return joiInst;
}

export function JoiDateFormat_YYYY({ isRequired }: { isRequired?: boolean } = {}) {
  const joiInst = Joi.string().custom(joi_yyyy_method, "custom YYYY validation");
  if (isRequired === true) {
    return joiInst.required();
  }
  return joiInst;
}

export function JoiStringCustomId({ isRequired }: { isRequired?: boolean } = {}) {
  const joiInst = Joi.string().trim().min(4).max(512).trim();
  if (isRequired) {
    return joiInst.required();
  }
  return joiInst;
}

export function JoiStringPhoneNumber({ isRequired }: { isRequired?: boolean } = {}) {
  const joiInst = Joi.string().empty("").custom(joi_phone_number);
  if (isRequired) {
    return joiInst.required();
  }
  return [JoiStripWhenNull(), joiInst] as [Joi.AnySchema<any>, Joi.StringSchema<string>];
}

export function JoiStripWhenNull() {
  return Joi.any().empty("").valid(null).strip();
}

export function JoiStringDefaultOrStrip({
  isRequired,
  lowercase,
  uppercase,
  isEmail,
  trim,
  valid,
  min,
  max,
}: {
  isRequired?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  isEmail?: boolean;
  trim?: boolean;
  min?: number;
  max?: number;
  valid?: any[];
} = {}) {
  let joiInst = Joi.string().empty("");
  if (lowercase) {
    joiInst = joiInst.lowercase();
  }
  if (uppercase) {
    joiInst = joiInst.uppercase();
  }
  if (trim) {
    joiInst = joiInst.trim();
  }
  if (isEmail) {
    joiInst = joiInst.custom(joi_email_method);
  }
  if (valid?.length) {
    joiInst = joiInst.valid(...valid);
  }

  if (min) {
    joiInst = joiInst.min(min);
  }

  if (max) {
    joiInst = joiInst.max(max);
  }

  if (isRequired) {
    return joiInst.required();
  }

  return [JoiStripWhenNull(), joiInst] as [Joi.AnySchema<any>, Joi.StringSchema<string>];
}
