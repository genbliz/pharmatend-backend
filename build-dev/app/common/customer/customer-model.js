import { JoiStringDefaultOrStrip, JoiStringPhoneNumber } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { CustomerCategoryEnum } from "./customer-types.js";
export class CustomerModel extends BaseTenantModelFunc() {
}
const CustomerCategoryEnumArray = Object.values(CustomerCategoryEnum);
CustomerModel.init({
    schema: {
        firstName: JoiStringDefaultOrStrip({ isRequired: true }),
        lastName: JoiStringDefaultOrStrip({ isRequired: true }),
        email: JoiStringDefaultOrStrip({ isEmail: true }),
        phone: JoiStringPhoneNumber({ isRequired: true }),
        category: JoiStringDefaultOrStrip({ valid: CustomerCategoryEnumArray, isRequired: true }),
        address: JoiStringDefaultOrStrip(),
    },
    tableName: "customers",
    returnFields: "basic",
});
//# sourceMappingURL=customer-model.js.map