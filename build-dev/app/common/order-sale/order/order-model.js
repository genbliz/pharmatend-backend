import Joi from "joi";
import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
export class OrderModel extends BaseTenantModelFunc() {
}
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
//# sourceMappingURL=order-model.js.map