import { DefinedTableNames } from "@/core/base-constants.js";
import { ISchemaMap } from "@/core/base-joi-helper.js";
import { BaseRepository } from "@/core/base-repository.js";
import { ICoreEntityBaseModel, IFieldAliases } from "@/core/base-types.js";

interface ICoreRepoOptions<T> {
  schemaSubDef: ISchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  fieldAliases: IFieldAliases<T>;
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
