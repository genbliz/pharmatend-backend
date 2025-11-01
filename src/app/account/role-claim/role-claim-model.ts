import Joi from "joi";
import { IRoleClaim } from "./role-claim-type";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper";
import { BaseTenantModelFunc } from "@/core/base-schema-model";

export class RoleClaimModel extends BaseTenantModelFunc<IRoleClaim>() {}

RoleClaimModel.init({
  schema: {
    roleName: JoiStringDefaultOrStrip({ isRequired: true }),
    claims: Joi.array().items(Joi.string().required()).required(),
    description: JoiStringDefaultOrStrip({ trim: true }),
  },
  tableName: "role_claims",
  returnFields: "basic",
});
