import * as v from "@/core/base-joi-helper.js";
import { IRoleClaim } from "@/account/role-claim/role-claim-type.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";

export class RoleClaimModel extends BaseTenantModelFunc<IRoleClaim>() {}

RoleClaimModel.init({
  schema: {
    roleName: v.ValString({ isRequired: true }),
    claims: v.ValArrayItemsRequired(v.ValString({ isRequired: true })),
    description: v.ValString({ trim: true }),
  },
  tableName: "role_claims",
  returnFields: "basic",
});
