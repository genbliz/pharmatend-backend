import * as v from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { CustomerCategoryEnum, ICustomer } from "@/common/customer/customer-types.js";

export class CustomerModel extends BaseTenantModelFunc<ICustomer>() {}

const CustomerCategoryEnumArray = Object.values(CustomerCategoryEnum);

CustomerModel.init({
  schema: {
    firstName: v.ValString({ isRequired: true }),
    lastName: v.ValString({ isRequired: true }),
    email: v.ValString({ isEmail: true }),
    phone: v.ValPhoneNumber({ isRequired: true }),
    category: v.ValString({ valid: CustomerCategoryEnumArray, isRequired: true }),
    address: v.ValString(),
  },
  tableName: "customers",
  returnFields: "basic",
});
