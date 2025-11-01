import { ICoreEntityTenantModel } from "@/core/base-types";

export interface ISale extends ICoreEntityTenantModel {
  name: string;
  amount: number;
  quantity: number;
  //
  total: number;
  discounted?: number;
  //
  orderId: string;
  productId: string;
  customerId?: string;
  //
  remark?: string;
}
