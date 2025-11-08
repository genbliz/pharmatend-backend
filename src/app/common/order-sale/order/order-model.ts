import * as v from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IOrder } from "@/common/order-sale/order/order-types.js";

export class OrderModel extends BaseTenantModelFunc<IOrder>() {}

OrderModel.init({
  schema: {
    grossTotal: v.ValNumber({ isRequired: true, min: 0 }),
    discount: v.ValNumber({ isRequired: true, min: 0 }),
    netTotal: v.ValNumber({ isRequired: true, min: 0 }),
    remark: v.ValString(),
    code: v.ValString({ isRequired: true }),
  },
  fieldAliases: [
    { source: "customerId", dest: "targetId" },
    { source: "code", dest: "sk01" },
  ],
  tableName: "orders",
  returnFields: "basic",
});
