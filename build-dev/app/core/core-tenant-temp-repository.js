import { DefinedTableNames } from "./base-constants.js";
import { BaseTenantRepository } from "./base-tenant-repository.js";
export class CoreTenantTempRepository extends BaseTenantRepository {
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
//# sourceMappingURL=core-tenant-temp-repository.js.map