import Joi from "joi";
import { JoiStringDefaultOrStrip, JoiDateFormat_YYYY_MM_DD, JoiStripWhenNull } from "@/core/base-joi-helper.js";
import { BaseTenantModelFunc } from "@/core/base-schema-model.js";
import { IProduct, ProductCategoryEnum } from "@/common/product/product-types.js";

export class ProductModel extends BaseTenantModelFunc<IProduct>() {}

const ProductCategoryArray = Object.values(ProductCategoryEnum);

ProductModel.init({
  schema: {
    name: JoiStringDefaultOrStrip({ isRequired: true, lowercase: true, trim: true }),
    amount: Joi.number().required().default(0).min(0),
    reorderLevel: [JoiStripWhenNull(), Joi.number().min(1)],
    category: JoiStringDefaultOrStrip({ isRequired: true, valid: [...ProductCategoryArray] }),
    //
    description: JoiStringDefaultOrStrip({ lowercase: true }),
    barcode: JoiStringDefaultOrStrip({ lowercase: true }),
    netWeight: JoiStringDefaultOrStrip({ trim: true }),
    grossWeight: JoiStringDefaultOrStrip({ trim: true }),
    imageUrl: JoiStringDefaultOrStrip({ trim: true }),
    stockLimit: [
      JoiStripWhenNull(),
      Joi.array().items({
        maximum: Joi.number().min(0).required(),
        minimum: Joi.number().min(0).required().default(1),
      }),
    ],
    specialPromo: [
      JoiStripWhenNull(),
      Joi.array().items({
        itemCount: Joi.number().min(0).required(),
        price: Joi.number().min(0).required().default(1),
        startDate: JoiDateFormat_YYYY_MM_DD({ isRequired: true }),
        endDate: JoiDateFormat_YYYY_MM_DD({ isRequired: true }),
      }),
    ],
    brand: [
      JoiStripWhenNull(),
      Joi.array().items({
        name: JoiStringDefaultOrStrip({ isRequired: true }),
        dataId: JoiStringDefaultOrStrip({ isRequired: true }),
      }),
    ],
  },
  fieldAliases: [
    ["barcode", "sk01"],
    ["category", "sk02"],
  ],
  tableName: "products",
  returnFields: "basic",
});
