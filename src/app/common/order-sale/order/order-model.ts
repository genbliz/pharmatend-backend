import Joi from "joi";
import { ValString } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IOrder } from "@/common/order-sale/order/order-types.js";

export class OrderModel extends BaseTenantModelFunc<IOrder>() {}

OrderModel.init({
  schema: {
    grossTotal: Joi.number().min(0).required(),
    discount: Joi.number().min(0).required(),
    netTotal: Joi.number().min(0).required(),
    remark: ValString(),
    code: ValString({ isRequired: true }),
  },
  fieldAliases: [
    { source: "customerId", dest: "targetId" },
    { source: "code", dest: "sk01" },
  ],
  tableName: "orders",
  returnFields: "basic",
});
