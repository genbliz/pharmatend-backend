import Joi from "joi";
import { DefinedTableNames } from "./base-constants.js";
import { BaseRepository } from "./base-repository.js";
import { ICoreEntityBaseModel } from "./base-types.js";

interface ICoreRepoOptions<T> {
  schemaSubDef: Joi.SchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  fieldAliases: [keyof T, keyof T][];
}

export abstract class CoreTempRepository<T extends ICoreEntityBaseModel> extends BaseRepository<T> {
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
