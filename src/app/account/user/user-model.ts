import * as v from "@/core/base-joi-helper.js";
import { getUserKindsArray, IUser } from "@/account/user/user-types.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { GenderEnum } from "@/core/base-types.js";

const userKindArray = getUserKindsArray();
const GenderArray = Object.values(GenderEnum);

export class UserModel extends BaseTenantModelFunc<IUser>() {}

UserModel.init({
  schema: {
    firstName: v.ValString({ isRequired: true, lowercase: true, trim: true }),
    lastName: v.ValString({ isRequired: true, lowercase: true, trim: true }),
    userName: v.ValString({ isRequired: true, lowercase: true, trim: true }),
    middleName: v.ValString({ lowercase: true, trim: true }),
    phone: v.ValPhoneNumber({ isRequired: true }),
    password: v.ValString({ isRequired: true, min: 4 }),
    email: v.ValString({ lowercase: true, isEmail: true }),
    address: v.ValString({ lowercase: true, trim: true }),
    isEmailConfirmed: v.ValBoolean({ defaultVal: false }),
    isPhoneConfirmed: v.ValBoolean({ defaultVal: false }),
    isLockOutEnabled: v.ValBoolean({ defaultVal: false }),
    lastChangedString: v.ValString({ trim: true }),
    accessFailedCount: v.ValNumber({ defaultValue: 0, min: 0 }),
    roleClaimIds: [v.ValStripWhenNull(), v.ValArrayItems(v.ValStringCustomId())],
    gender: v.ValString({ uppercase: true, valid: [...GenderArray] }),
    userKind: [
      //
      v.ValStripWhenNull(),
      v.ValArrayItems(v.ValString({ valid: userKindArray })),
    ],
    dateOfBirth: v.ValDateFormat_YYYY_MM_DD(),
    enablePrivacy: v.ValBoolean({ defaultVal: false }),
    sanboxedUser: v.ValBoolean({ defaultVal: false }),
    staffIdentificationId: v.ValString({ trim: true }),
    //
    countryCallingCode: v.ValStripAnyField(),
  },
  tableName: "users",
  returnFields: "basic",
  excludeFields: ["password", "lastChangedString", "countryCallingCode"],
});
