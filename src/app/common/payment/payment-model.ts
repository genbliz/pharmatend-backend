import Joi from "joi";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper";
import { BaseTenantModelFunc } from "@/core/base-schema-model";
import { IPayment } from "./payment-types";

export class PaymentModel extends BaseTenantModelFunc<IPayment>() {}

PaymentModel.init({
  schema: {
    amount: Joi.number().min(0).required(),
    orderId: JoiStringDefaultOrStrip({ isRequired: true }),
    mode: JoiStringDefaultOrStrip({ isRequired: true }),
    //
    remark: JoiStringDefaultOrStrip(),
  },
  tableName: "payments",
  returnFields: "basic",
});
