import Joi from "joi";
import { DefinedTableNames } from "@/core/base-constants.js";
import { BaseRepository } from "@/core/base-repository.js";
import { ICoreEntityBaseModel } from "@/core/base-types.js";

interface ICoreRepoOptions<T> {
  schemaSubDef: Joi.SchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  fieldAliases: IFieldAliases<T>;
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
