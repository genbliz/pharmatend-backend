import * as v from "@/core/base-joi-helper.js";
import { IUserLogin, UserLoginStatusEnum } from "@/account/user-login/user-login-types.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";

const UserLoginStatusArray = Object.values(UserLoginStatusEnum);

export class UserLoginModel extends BaseTenantModelFunc<IUserLogin>() {}

UserLoginModel.init({
  schema: {
    userId: v.ValString({ isRequired: true }),
    status: v.ValString({ isRequired: true, valid: UserLoginStatusArray }),
    remark: v.ValString({ trim: true }),
  },
  tableName: "users_logins",
  returnFields: "basic",
  fieldAliases: [{ source: "userId", dest: "targetId" }],
});
