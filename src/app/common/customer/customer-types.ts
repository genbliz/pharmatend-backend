import { ICoreEntityTenantModel } from "@/core/base-types";

export const CustomerCategoryEnum = {
  BUSINESS: "BUSINESS",
  INDIVIDUAL: "INDIVIDUAL",
} as const;

export type CustomerCategoryEnum = (typeof CustomerCategoryEnum)[keyof typeof CustomerCategoryEnum];

export interface ICustomer extends ICoreEntityTenantModel {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  category?: CustomerCategoryEnum;
}
