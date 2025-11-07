import { DefinedTableNames } from "./base-constants.js";
import { BaseRepository } from "./base-repository.js";
export class CoreTempRepository extends BaseRepository {
    constructor({ schemaSubDef, featureEntity, fieldAliases, strictRequiredFields }) {
        super({
            schemaSubDef,
            featureEntity,
            fieldAliases,
            strictRequiredFields,
            secondaryIndexOptions: [],
            baseTableName: DefinedTableNames.TEMP,
        });
    }
}
//# sourceMappingURL=core-temp-repository.js.map