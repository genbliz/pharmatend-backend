import Joi from "joi";
import { IUserLogin, UserLoginStatusEnum } from "./user-login-types";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper";
import { BaseTenantModelFunc } from "@/core/base-schema-model";

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
