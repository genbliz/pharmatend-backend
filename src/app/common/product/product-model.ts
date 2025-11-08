import * as v from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IProduct, ProductCategoryEnum } from "@/common/product/product-types.js";

export class ProductModel extends BaseTenantModelFunc<IProduct>() {}

const ProductCategoryArray = Object.values(ProductCategoryEnum);

ProductModel.init({
  schema: {
    name: v.ValString({ isRequired: true, lowercase: true, trim: true }),
    amount: v.ValCurrency({ isRequired: true, min: 0, defaultValue: 0 }),
    category: v.ValString({ isRequired: true, valid: [...ProductCategoryArray] }),
    reorderLevel: v.ValNumber({ min: 1 }),
    description: v.ValString({ lowercase: true }),
    barcode: v.ValString({ lowercase: true }),
    netWeight: v.ValString({ trim: true }),
    grossWeight: v.ValString({ trim: true }),
    imageUrl: v.ValString({ trim: true }),
    stockLimit: [
      v.ValStripWhenNull(),
      v.ValArrayItems(
        v.ValObject({
          maximum: v.ValNumber({ isRequired: true, min: 0 }),
          minimum: v.ValNumber({ isRequired: true, min: 0, defaultValue: 1 }),
        }),
      ),
    ],
    specialPromo: [
      v.ValStripWhenNull(),
      v.ValArrayItems(
        v.ValObject({
          itemCount: v.ValNumber({ isRequired: true, min: 0, isInteger: true }),
          price: v.ValCurrency({ isRequired: true, min: 0, defaultValue: 1 }),
          startDate: v.ValDateFormat_YYYY_MM_DD({ isRequired: true }),
          endDate: v.ValDateFormat_YYYY_MM_DD({ isRequired: true }),
        }),
      ),
    ],
    brand: [
      v.ValStripWhenNull(),
      v.ValArrayItems(
        v.ValObject({
          name: v.ValString({ isRequired: true }),
          dataId: v.ValString({ isRequired: true }),
        }),
      ),
    ],
  },
  fieldAliases: [
    { source: "barcode", dest: "sk01" },
    { source: "category", dest: "sk02" },
  ],
  tableName: "products",
  returnFields: "basic",
});
