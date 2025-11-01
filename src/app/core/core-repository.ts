import Joi from "joi";
import { DefinedTableNames } from "./base-constants";
import { BaseRepository } from "./base-repository";
import { ICoreEntityBaseModel } from "./base-types";

interface ICoreRepoOptions<T> {
  schemaSubDef: Joi.SchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  fieldAliases: [keyof T, keyof T][];
}

export abstract class CoreRepository<T extends ICoreEntityBaseModel> extends BaseRepository<T> {
  constructor({ schemaSubDef, featureEntity, strictRequiredFields, fieldAliases }: ICoreRepoOptions<T>) {
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
