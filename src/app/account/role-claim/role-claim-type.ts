import { ICoreEntityTenantModel } from "@/core/base-types.js";

export interface IRoleClaim extends ICoreEntityTenantModel {
  roleName: string;
  claims: string[];
  description?: string;
}
