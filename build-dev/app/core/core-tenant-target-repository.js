import { DefinedTableNames } from "./base-constants.js";
import { BaseTenantTargetRepository } from "./base-tenant-target-repository.js";
export class CoreTenantTargetRepository extends BaseTenantTargetRepository {
    constructor({ schemaSubDef, featureEntity, fieldAliases, strictRequiredFields }) {
        super({
            schemaSubDef,
            featureEntity,
            fieldAliases,
            strictRequiredFields,
            baseTableName: DefinedTableNames.MAIN,
        });
    }
}
//# sourceMappingURL=core-tenant-target-repository.js.map