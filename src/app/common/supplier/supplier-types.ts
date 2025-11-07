import { ICoreEntityTenantModel } from "@/core/base-types.js";

export interface ISupplier extends ICoreEntityTenantModel {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  otherPhones?: string[];
  address?: string;
}
