import Joi from "joi";
import { IRoleClaim } from "@/account/role-claim/role-claim-type.js";
import { ValString } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";

export class RoleClaimModel extends BaseTenantModelFunc<IRoleClaim>() {}

RoleClaimModel.init({
  schema: {
    roleName: ValString({ isRequired: true }),
    claims: Joi.array().items(Joi.string().required()).required(),
    description: ValString({ trim: true }),
  },
  tableName: "role_claims",
  returnFields: "basic",
});
