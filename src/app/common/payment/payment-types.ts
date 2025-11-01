import { ICoreEntityTenantModel } from "@/core/base-types";

export interface IPayment extends ICoreEntityTenantModel {
  orderId: string;
  customerId: string;
  amount: number;
  mode?: string;
  remark?: string;
}
