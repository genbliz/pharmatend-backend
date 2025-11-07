import { ICoreEntityTenantModel } from "@/core/base-types.js";

export interface IPayment extends ICoreEntityTenantModel {
  orderId: string;
  customerId: string;
  amount: number;
  mode?: string;
  remark?: string;
}
