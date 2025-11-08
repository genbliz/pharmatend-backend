import { ValString, ValPhoneNumber } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { CustomerCategoryEnum, ICustomer } from "@/common/customer/customer-types.js";

export class CustomerModel extends BaseTenantModelFunc<ICustomer>() {}

const CustomerCategoryEnumArray = Object.values(CustomerCategoryEnum);

CustomerModel.init({
  schema: {
    firstName: ValString({ isRequired: true }),
    lastName: ValString({ isRequired: true }),
    email: ValString({ isEmail: true }),
    phone: ValPhoneNumber({ isRequired: true }),
    category: ValString({ valid: CustomerCategoryEnumArray, isRequired: true }),
    address: ValString(),
  },
  tableName: "customers",
  returnFields: "basic",
});
