import { JoiStringDefaultOrStrip } from "@/core/base-joi-helper.js";
import { BaseCoreModelFunc } from "@/core/base-schema-model.js";
export class CacheDataModel extends BaseCoreModelFunc() {
}
CacheDataModel.init({
    schema: {
        category: JoiStringDefaultOrStrip({ isRequired: true }),
        dataEncoded: JoiStringDefaultOrStrip({ isRequired: true }),
        dateControlEnc: JoiStringDefaultOrStrip({ isRequired: true }),
    },
    tableName: "cached_data",
    returnFields: "basic",
});
//# sourceMappingURL=cached-data-model.js.map