import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper.js";
import { BaseCoreModelFunc } from "@/core/base-schema-model.js";
import { ICachedData } from "./cached-data-type.js";

export class CacheDataModel extends BaseCoreModelFunc<ICachedData>() {}

CacheDataModel.init({
  schema: {
    category: JoiStringDefaultOrStrip({ isRequired: true }),
    dataEncoded: JoiStringDefaultOrStrip({ isRequired: true }),
    dateControlEnc: JoiStringDefaultOrStrip({ isRequired: true }),
  },
  tableName: "cached_data",
  returnFields: "basic",
});
