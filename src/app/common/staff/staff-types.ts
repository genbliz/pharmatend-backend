import { ICoreEntityTenantModel } from "@/core/base-types.js";

export interface IStaff extends ICoreEntityTenantModel {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address: string;
  department?: string;
  managerId?: string;
  position?: string;
  joinDate: string;
  roleIds?: string[];
}
