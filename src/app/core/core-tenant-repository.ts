import Joi from "joi";
import { DefinedTableNames } from "./base-constants";
import { BaseTenantRepository } from "./base-tenant-repository";
import { ICoreEntityTenantModel } from "./base-types";

interface ICoreRepoOptions<T> {
  schemaSubDef: Joi.SchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  fieldAliases: [keyof T, keyof T][];
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
