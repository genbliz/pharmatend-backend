import Joi from "joi";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
export class RoleClaimModel extends BaseTenantModelFunc() {
}
RoleClaimModel.init({
    schema: {
        roleName: JoiStringDefaultOrStrip({ isRequired: true }),
        claims: Joi.array().items(Joi.string().required()).required(),
        description: JoiStringDefaultOrStrip({ trim: true }),
    },
    tableName: "role_claims",
    returnFields: "basic",
});
//# sourceMappingURL=role-claim-model.js.map