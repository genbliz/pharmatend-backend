import { ICoreEntityTenantModel } from "@/core/base-types";

export interface IRoleClaim extends ICoreEntityTenantModel {
  roleName: string;
  claims: string[];
  description?: string;
}
