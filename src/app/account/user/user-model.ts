import Joi from "joi";
import { ValDateFormat_YYYY_MM_DD, ValString, ValPhoneNumber, ValStripWhenNull } from "@/core/base-joi-helper.js";
import { getUserKindsArray, IUser } from "@/account/user/user-types.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { GenderEnum } from "@/core/base-types.js";

const userKindArray = getUserKindsArray();

const GenderArray = Object.values(GenderEnum);

export class UserModel extends BaseTenantModelFunc<IUser>() {}

UserModel.init({
  schema: {
    firstName: ValString({ isRequired: true, lowercase: true, trim: true }),
    lastName: ValString({ isRequired: true, lowercase: true, trim: true }),
    userName: ValString({ isRequired: true, lowercase: true, trim: true }),
    middleName: ValString({ lowercase: true, trim: true }),
    phone: ValPhoneNumber({ isRequired: true }),
    password: Joi.string().required().min(4),
    email: ValString({ lowercase: true, isEmail: true }),
    address: ValString({ lowercase: true, trim: true }),
    isEmailConfirmed: Joi.boolean().default(false),
    isPhoneConfirmed: Joi.boolean().default(false),
    isLockOutEnabled: Joi.boolean().default(false),
    lastChangedString: ValString({ trim: true }),
    accessFailedCount: Joi.number().default(0).min(0),
    roleClaimIds: [ValStripWhenNull(), Joi.array().items(Joi.string())],
    gender: ValString({ uppercase: true, valid: [...GenderArray] }),
    userKind: [ValStripWhenNull(), Joi.array().items(Joi.string().valid(...userKindArray))],
    dateOfBirth: ValDateFormat_YYYY_MM_DD(),
    enablePrivacy: Joi.boolean().default(false),
    sanboxedUser: Joi.boolean().default(false),
    staffIdentificationId: ValString({ trim: true }),
    //
    countryCallingCode: Joi.any().strip(),
  },
  tableName: "users",
  returnFields: "basic",
  excludeFields: ["password", "lastChangedString", "countryCallingCode"],
});
