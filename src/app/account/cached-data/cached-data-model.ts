import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper";
import { BaseCoreModelFunc } from "@/core/base-schema-model";
import { ICachedData } from "./cached-data-type";

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
