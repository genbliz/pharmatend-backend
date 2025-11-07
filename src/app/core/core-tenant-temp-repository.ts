import Joi from "joi";
import { DefinedTableNames } from "@/core/base-constants.js";
import { BaseTenantRepository } from "@/core/base-tenant-repository.js";
import { ICoreEntityTenantModel } from "@/core/base-types.js";

interface ICoreRepoOptions<T> {
  schemaSubDef: Joi.SchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  fieldAliases: IFieldAliases<T>;
}

export abstract class CoreTenantTempRepository<T extends ICoreEntityTenantModel> extends BaseTenantRepository<T> {
  constructor({ schemaSubDef, featureEntity, fieldAliases, strictRequiredFields }: ICoreRepoOptions<T>) {
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
