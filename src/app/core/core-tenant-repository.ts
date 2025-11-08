import { DefinedTableNames } from "@/core/base-constants.js";
import { ISchemaMap } from "@/core/base-joi-helper.js";
import { BaseTenantRepository } from "@/core/base-tenant-repository.js";
import { ICoreEntityTenantModel, IFieldAliases } from "@/core/base-types.js";

interface ICoreRepoOptions<T> {
  schemaSubDef: ISchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  fieldAliases: IFieldAliases<T>;
}

export abstract class CoreTenantRepository<T extends ICoreEntityTenantModel> extends BaseTenantRepository<T> {
  constructor({ schemaSubDef, featureEntity, fieldAliases, strictRequiredFields }: ICoreRepoOptions<T>) {
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
