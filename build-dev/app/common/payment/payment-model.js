import Joi from "joi";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
export class PaymentModel extends BaseTenantModelFunc() {
}
PaymentModel.init({
    schema: {
        amount: Joi.number().min(0).required(),
        orderId: JoiStringDefaultOrStrip({ isRequired: true }),
        mode: JoiStringDefaultOrStrip({ isRequired: true }),
        remark: JoiStringDefaultOrStrip(),
    },
    tableName: "payments",
    returnFields: "basic",
});
//# sourceMappingURL=payment-model.js.map