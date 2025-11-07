import Joi from "joi";
import { JoiStringDefaultOrStrip, JoiStripWhenNull } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { ISale } from "./sale-types.js";

export class SaleModel extends BaseTenantModelFunc<ISale>() {}

SaleModel.init({
  schema: {
    name: JoiStringDefaultOrStrip({ isRequired: true, trim: true, lowercase: true }),
    quantity: Joi.number().integer().min(1).required(),
    amount: Joi.number().min(0).required(),
    //
    total: Joi.number().min(0).required(),
    discounted: [JoiStripWhenNull(), Joi.number().min(0).required()],
    //
    orderId: JoiStringDefaultOrStrip({ isRequired: true }),
    productId: JoiStringDefaultOrStrip({ isRequired: true }),
    //
    remark: JoiStringDefaultOrStrip(),
  },
  fieldAliases: [["orderId", "targetId"]],
  tableName: "sales",
  returnFields: "basic",
});
