import Joi from "joi";
import { IUserLogin, UserLoginStatusEnum } from "@/account/user-login/user-login-types.js";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";

const UserLoginStatusArray = Object.values(UserLoginStatusEnum);

export class UserLoginModel extends BaseTenantModelFunc<IUserLogin>() {}

UserLoginModel.init({
  schema: {
    userId: JoiStringDefaultOrStrip({ isRequired: true }),
    status: Joi.string()
      .valid(...UserLoginStatusArray)
      .required(),
    remark: JoiStringDefaultOrStrip({ trim: true }),
  },
  tableName: "users_logins",
  returnFields: "basic",
  fieldAliases: [["userId", "targetId"]],
});
