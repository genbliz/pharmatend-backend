import { JoiStringDefaultOrStrip, JoiStringPhoneNumber } from "@/core/base-joi-helper";
import { BaseTenantModelFunc } from "@/core/base-schema-model";
import { CustomerCategoryEnum, ICustomer } from "./customer-types";

export class CustomerModel extends BaseTenantModelFunc<ICustomer>() {}

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
