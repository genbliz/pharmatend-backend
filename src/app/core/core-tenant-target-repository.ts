import Joi from "joi";
import { DefinedTableNames } from "@/core/base-constants.js";
import { BaseTenantTargetRepository } from "@/core/base-tenant-target-repository.js";
import { ICoreEntityTargetModel } from "@/core/base-types.js";

interface ICoreRepoOptions<T> {
  schemaSubDef: Joi.SchemaMap;
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
