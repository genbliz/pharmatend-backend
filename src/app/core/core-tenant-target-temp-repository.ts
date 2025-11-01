import Joi from "joi";
import { DefinedTableNames } from "./base-constants";
import { BaseTenantTargetRepository } from "./base-tenant-target-repository";
import { ICoreEntityTargetModel } from "./base-types";

interface ICoreRepoOptions<T> {
  schemaSubDef: Joi.SchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  fieldAliases: [keyof T, keyof T][];
}

export abstract class CoreTenantTargetTempRepository<
  T extends ICoreEntityTargetModel,
> extends BaseTenantTargetRepository<T> {
  constructor({ schemaSubDef, featureEntity, fieldAliases, strictRequiredFields }: ICoreRepoOptions<T>) {
    super({
      schemaSubDef,
      featureEntity,
      fieldAliases,
      strictRequiredFields,
      baseTableName: DefinedTableNames.TEMP,
    });
  }
}
