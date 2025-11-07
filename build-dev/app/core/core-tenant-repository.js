import { DefinedTableNames } from "./base-constants.js";
import { BaseTenantRepository } from "./base-tenant-repository.js";
export class CoreTenantRepository extends BaseTenantRepository {
    constructor({ schemaSubDef, featureEntity, fieldAliases, strictRequiredFields }) {
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
//# sourceMappingURL=core-tenant-repository.js.map