import { ICoreEntityTargetModel } from "@/core/base-types.js";
import { ISale } from "../sale/sale-types.js";

export interface IOrder extends ICoreEntityTargetModel {
  grossTotal: number;
  discount: number;
  netTotal: number;
  customerId?: string;
  remark?: string;
  code: string;
}

export interface IOrderExtra extends IOrder {
  tempOrderShortCode?: string;
  sales?: ISale[];
}
