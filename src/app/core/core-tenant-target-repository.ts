import { DefinedTableNames } from "@/core/base-constants.js";
import { ISchemaMap } from "@/core/base-joi-helper.js";
import { BaseTenantTargetRepository } from "@/core/base-tenant-target-repository.js";
import { ICoreEntityTargetModel, IFieldAliases } from "@/core/base-types.js";

interface ICoreRepoOptions<T> {
  schemaSubDef: ISchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  fieldAliases: IFieldAliases<T>;
}

export abstract class CoreTenantTargetRepository<
  T extends ICoreEntityTargetModel,
> extends BaseTenantTargetRepository<T> {
  constructor({ schemaSubDef, featureEntity, fieldAliases, strictRequiredFields }: ICoreRepoOptions<T>) {
    super({
      schemaSubDef,
      featureEntity,
      fieldAliases,
      strictRequiredFields,
      baseTableName: DefinedTableNames.MAIN,
    });
  }
}
