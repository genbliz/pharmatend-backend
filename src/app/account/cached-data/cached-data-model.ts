import { ValString } from "@/core/base-joi-helper.js";
import { BaseCoreModelFunc } from "@/core/base-schema-model.js";
import { ICachedData } from "@/account/cached-data/cached-data-type.js";

export class CacheDataModel extends BaseCoreModelFunc<ICachedData>() {}

CacheDataModel.init({
  schema: {
    category: ValString({ isRequired: true }),
    dataEncoded: ValString({ isRequired: true }),
    dateControlEnc: ValString({ isRequired: true }),
  },
  tableName: "cached_data",
  returnFields: "basic",
});
