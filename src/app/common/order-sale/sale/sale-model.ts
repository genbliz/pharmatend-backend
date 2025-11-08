import * as v from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { ISale } from "@/common/order-sale/sale/sale-types.js";

export class SaleModel extends BaseTenantModelFunc<ISale>() {}

SaleModel.init({
  schema: {
    name: v.ValString({ isRequired: true, trim: true, lowercase: true }),
    quantity: v.ValNumber({ isRequired: true, min: 1, isInteger: true }),
    amount: v.ValNumber({ isRequired: true, min: 0 }),
    //
    total: v.ValNumber({ isRequired: true, min: 0 }),
    discounted: v.ValNumber({ isRequired: true, min: 0 }),
    //
    orderId: v.ValString({ isRequired: true }),
    productId: v.ValString({ isRequired: true }),
    //
    remark: v.ValString(),
  },
  fieldAliases: [{ source: "orderId", dest: "targetId" }],
  tableName: "sales",
  returnFields: "basic",
});
