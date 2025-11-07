import Joi from "joi";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IOrder } from "./order-types.js";

export class OrderModel extends BaseTenantModelFunc<IOrder>() {}

OrderModel.init({
  schema: {
    grossTotal: Joi.number().min(0).required(),
    discount: Joi.number().min(0).required(),
    netTotal: Joi.number().min(0).required(),
    remark: JoiStringDefaultOrStrip(),
  },
  fieldAliases: [["customerId", "targetId"]],
  tableName: "orders",
  returnFields: "basic",
});
