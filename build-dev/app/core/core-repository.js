import { DefinedTableNames } from "./base-constants.js";
import { BaseRepository } from "./base-repository.js";
export class CoreRepository extends BaseRepository {
    constructor({ schemaSubDef, featureEntity, strictRequiredFields, fieldAliases }) {
        super({
            schemaSubDef,
            featureEntity,
            fieldAliases,
            strictRequiredFields,
            secondaryIndexOptions: [],
            baseTableName: DefinedTableNames.MAIN,
        });
    }
}
//# sourceMappingURL=core-repository.js.map