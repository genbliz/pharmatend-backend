import * as v from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IPayment } from "@/common/payment/payment-types.js";

export class PaymentModel extends BaseTenantModelFunc<IPayment>() {}

PaymentModel.init({
  schema: {
    amount: v.ValNumber({ isRequired: true, min: 0 }),
    orderId: v.ValString({ isRequired: true }),
    mode: v.ValString({ isRequired: true }),
    remark: v.ValString(),
  },
  tableName: "payments",
  returnFields: "basic",
});
