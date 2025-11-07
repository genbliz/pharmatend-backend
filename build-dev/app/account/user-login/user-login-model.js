import Joi from "joi";
import { UserLoginStatusEnum } from "./user-login-types.js";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
const UserLoginStatusArray = Object.values(UserLoginStatusEnum);
export class UserLoginModel extends BaseTenantModelFunc() {
}
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
//# sourceMappingURL=user-login-model.js.map