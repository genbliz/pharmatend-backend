import Joi from "joi";
import { ValString, ValDateFormat_YYYY_MM_DD, ValStripWhenNull } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IProduct, ProductCategoryEnum } from "@/common/product/product-types.js";

export class ProductModel extends BaseTenantModelFunc<IProduct>() {}

const ProductCategoryArray = Object.values(ProductCategoryEnum);

ProductModel.init({
  schema: {
    name: ValString({ isRequired: true, lowercase: true, trim: true }),
    amount: Joi.number().required().default(0).min(0),
    reorderLevel: [ValStripWhenNull(), Joi.number().min(1)],
    category: ValString({ isRequired: true, valid: [...ProductCategoryArray] }),
    //
    description: ValString({ lowercase: true }),
    barcode: ValString({ lowercase: true }),
    netWeight: ValString({ trim: true }),
    grossWeight: ValString({ trim: true }),
    imageUrl: ValString({ trim: true }),
    stockLimit: [
      ValStripWhenNull(),
      Joi.array().items({
        maximum: Joi.number().min(0).required(),
        minimum: Joi.number().min(0).required().default(1),
      }),
    ],
    specialPromo: [
      ValStripWhenNull(),
      Joi.array().items({
        itemCount: Joi.number().min(0).required(),
        price: Joi.number().min(0).required().default(1),
        startDate: ValDateFormat_YYYY_MM_DD({ isRequired: true }),
        endDate: ValDateFormat_YYYY_MM_DD({ isRequired: true }),
      }),
    ],
    brand: [
      ValStripWhenNull(),
      Joi.array().items({
        name: ValString({ isRequired: true }),
        dataId: ValString({ isRequired: true }),
      }),
    ],
  },
  fieldAliases: [
    { source: "barcode", dest: "sk01" },
    { source: "category", dest: "sk02" },
  ],
  tableName: "products",
  returnFields: "basic",
});
