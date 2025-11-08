import Joi from "joi";
import { ValString, ValStripWhenNull } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { ISale } from "@/common/order-sale/sale/sale-types.js";

export class SaleModel extends BaseTenantModelFunc<ISale>() {}

SaleModel.init({
  schema: {
    name: ValString({ isRequired: true, trim: true, lowercase: true }),
    quantity: Joi.number().integer().min(1).required(),
    amount: Joi.number().min(0).required(),
    //
    total: Joi.number().min(0).required(),
    discounted: [ValStripWhenNull(), Joi.number().min(0).required()],
    //
    orderId: ValString({ isRequired: true }),
    productId: ValString({ isRequired: true }),
    //
    remark: ValString(),
  },
  fieldAliases: [{ source: "orderId", dest: "targetId" }],
  tableName: "sales",
  returnFields: "basic",
});
