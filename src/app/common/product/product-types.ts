import { ICoreEntityTenantModel, ITextValue } from "@/core/base-types";

export const ProductCategoryEnum = {
  DRUG: "DRUG",
  SKINCARE: "SKINCARE",
  FRAGRANCE: "FRAGRANCE",
  GROCERY: "GROCERY",
} as const;

export type ProductCategoryEnum = (typeof ProductCategoryEnum)[keyof typeof ProductCategoryEnum];

export interface IProduct extends ICoreEntityTenantModel {
  name: string;
  amount: number;
  category: ProductCategoryEnum;
  barcode?: string;
  description?: string;
  netWeight?: string;
  grossWeight?: string;
  imageUrl?: string;
  reorderLevel?: number;
  brand?: {
    name: string;
    dataId: string;
  };
  specialPromo?: {
    itemCount: number;
    price: number;
    startDate: string;
    endDate: string;
  };
  stockLimit?: {
    minimum: number;
    maximum: number;
  };
}

export interface IProductExtra extends IProduct {
  categoryOptions?: ITextValue<ProductCategoryEnum>[];
}
