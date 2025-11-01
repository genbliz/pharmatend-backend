import Joi from "joi";
import {
  JoiDateFormat_YYYY_MM_DD,
  JoiStringDefaultOrStrip,
  JoiStringPhoneNumber,
  JoiStripWhenNull,
} from "@/core/base-joi-helper";
import { getUserKindsArray, IUser } from "./user-types";
import { BaseTenantModelFunc } from "@/core/base-schema-model";
import { GenderEnum } from "../../core/base-types";

const userKindArray = getUserKindsArray();

const GenderArray = Object.values(GenderEnum);

export class UserModel extends BaseTenantModelFunc<IUser>() {}

UserModel.init({
  schema: {
    firstName: JoiStringDefaultOrStrip({ isRequired: true, lowercase: true, trim: true }),
    lastName: JoiStringDefaultOrStrip({ isRequired: true, lowercase: true, trim: true }),
    userName: JoiStringDefaultOrStrip({ isRequired: true, lowercase: true, trim: true }),
    middleName: JoiStringDefaultOrStrip({ lowercase: true, trim: true }),
    phone: JoiStringPhoneNumber({ isRequired: true }),
    password: Joi.string().required().min(4),
    email: JoiStringDefaultOrStrip({ lowercase: true, isEmail: true }),
    address: JoiStringDefaultOrStrip({ lowercase: true, trim: true }),
    isEmailConfirmed: Joi.boolean().default(false),
    isPhoneConfirmed: Joi.boolean().default(false),
    isLockOutEnabled: Joi.boolean().default(false),
    lastChangedString: JoiStringDefaultOrStrip({ trim: true }),
    accessFailedCount: Joi.number().default(0).min(0),
    roleClaimIds: [JoiStripWhenNull(), Joi.array().items(Joi.string())],
    gender: JoiStringDefaultOrStrip({ uppercase: true, valid: [...GenderArray] }),
    userKind: [JoiStripWhenNull(), Joi.array().items(Joi.string().valid(...userKindArray))],
    dateOfBirth: JoiDateFormat_YYYY_MM_DD(),
    enablePrivacy: Joi.boolean().default(false),
    sanboxedUser: Joi.boolean().default(false),
    staffIdentificationId: JoiStringDefaultOrStrip({ trim: true }),
    //
    countryCallingCode: Joi.any().strip(),
  },
  tableName: "users",
  returnFields: "basic",
  excludeFields: ["password", "lastChangedString", "countryCallingCode"],
});
