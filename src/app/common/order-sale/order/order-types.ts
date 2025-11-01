import { ICoreEntityTargetModel } from "@/core/base-types";
import { ISale } from "../sale/sale-types";

export interface IOrder extends ICoreEntityTargetModel {
  grossTotal: number;
  discount: number;
  netTotal: number;
  customerId?: string;
  remark?: string;
}

export interface IOrderExtra extends IOrder {
  tempOrderShortCode?: string;
  sales?: ISale[];
}
