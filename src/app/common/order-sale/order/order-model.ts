import Joi from "joi";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IOrder } from "@/common/order-sale/order/order-types.js";

export class OrderModel extends BaseTenantModelFunc<IOrder>() {}

OrderModel.init({
  schema: {
    grossTotal: Joi.number().min(0).required(),
    discount: Joi.number().min(0).required(),
    netTotal: Joi.number().min(0).required(),
    remark: JoiStringDefaultOrStrip(),
    code: JoiStringDefaultOrStrip({ isRequired: true }),
  },
  fieldAliases: [
    ["customerId", "targetId"],
    ["code", "sk01"],
  ],
  tableName: "orders",
  returnFields: "basic",
});
