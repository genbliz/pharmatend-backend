import Joi from "joi";
import { IUserLogin, UserLoginStatusEnum } from "@/account/user-login/user-login-types.js";
import { ValString } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";

const UserLoginStatusArray = Object.values(UserLoginStatusEnum);

export class UserLoginModel extends BaseTenantModelFunc<IUserLogin>() {}

UserLoginModel.init({
  schema: {
    userId: ValString({ isRequired: true }),
    status: Joi.string()
      .valid(...UserLoginStatusArray)
      .required(),
    remark: ValString({ trim: true }),
  },
  tableName: "users_logins",
  returnFields: "basic",
  fieldAliases: [{ source: "userId", dest: "targetId" }],
});
