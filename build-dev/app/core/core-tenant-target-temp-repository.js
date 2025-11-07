import { DefinedTableNames } from "./base-constants.js";
import { BaseTenantTargetRepository } from "./base-tenant-target-repository.js";
export class CoreTenantTargetTempRepository extends BaseTenantTargetRepository {
    constructor({ schemaSubDef, featureEntity, fieldAliases, strictRequiredFields }) {
        super({
            schemaSubDef,
            featureEntity,
            fieldAliases,
            strictRequiredFields,
            baseTableName: DefinedTableNames.TEMP,
        });
    }
}
//# sourceMappingURL=core-tenant-target-temp-repository.js.map