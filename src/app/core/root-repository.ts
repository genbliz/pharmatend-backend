import Joi from "joi";
import { UtilService } from "@/services/util-service";
import {
  PouchDataOperation,
  type IMocodyIndexDefinition,
  type IMocodyFieldCondition,
  CouchDataOperation,
} from "mocody";
import { BaseHelperUtils } from "./base-error-helper-utils";
import { BaseConnections } from "./base-connections";
import { CreateFriendlyError } from "../helper/response-model";
import { UniqueIdGeneratorService } from "../services/unique-id-generator-service";
import { ICoreEntityBaseModel } from "./base-types";

interface IRootRepositoryOptions<T> {
  schemaSubDef: Joi.SchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  secondaryIndexOptions: IMocodyIndexDefinition<T>[];
  baseTableName: string;
  fieldAliases: [keyof T, keyof T][];
}

const tableNamesObj: Record<string, number> = {};

function checkDuplicate(tableName: string) {
  if (tableNamesObj[tableName]) {
    tableNamesObj[tableName] = tableNamesObj[tableName] + 1;
  } else {
    tableNamesObj[tableName] = 1;
  }
  if (tableNamesObj[tableName] > 1) {
    throw CreateFriendlyError(`Duplicated table name: '${tableName}'`);
  }
  // console.log({ tableName });
}

export abstract class RootRepository<T extends ICoreEntityBaseModel> {
  protected readonly root_util = new BaseHelperUtils();

  private readonly _mocodyBaseCouch: CouchDataOperation<T> | undefined;
  private readonly _mocodyBasePouch: PouchDataOperation<T> | undefined;
  private readonly _featureEntityValue: string;
  private readonly _fieldAliases: [keyof T, keyof T][];

  constructor({
    schemaSubDef,
    featureEntity,
    strictRequiredFields,
    secondaryIndexOptions,
    baseTableName,
    fieldAliases,
  }: IRootRepositoryOptions<T>) {
    // this._mocodyBaseCouch = new PouchDataOperation<T>({
    //   baseTableName,
    //   schemaDef: schemaSubDef,
    //   featureEntityValue: featureEntity,
    //   secondaryIndexOptions,
    //   strictRequiredFields,
    //   pouchDbInitializer: () => BaseConnections.getPouchConnection(),
    //   dataKeyGenerator: () => UniqueIdGeneratorService.generateDataId(),
    // });

    this._mocodyBaseCouch = new CouchDataOperation<T>({
      baseTableName,
      schemaDef: schemaSubDef,
      featureEntityValue: featureEntity,
      secondaryIndexOptions,
      strictRequiredFields,
      couchDbInitializer: () => BaseConnections.getCouchConnection(),
      dataKeyGenerator: () => UniqueIdGeneratorService.generateDataId(),
    });

    checkDuplicate(featureEntity);
    this._featureEntityValue = featureEntity;
    this._fieldAliases = fieldAliases;
  }

  protected async root_createIndexes() {
    if (this._mocodyBaseCouch) {
      const createIndexResult = await this._mocodyBaseCouch.mocody_tableManager().mocody_createDefinedIndexes();
      const createdIdexes = await this._mocodyBaseCouch.mocody_tableManager().mocody_getIndexes();
      console.log(JSON.stringify({ createdIdexes, createIndexResult }, null, 2));
    }
  }

  protected root__mocodyBaseInstance(): CouchDataOperation<T> | PouchDataOperation<T> {
    if (this._mocodyBaseCouch) {
      return this._mocodyBaseCouch;
    }
    if (this._mocodyBasePouch) {
      return this._mocodyBasePouch;
    }
    throw this.root_util.createFriendlyError("Db Instance not initialized");
  }

  protected root_getFeatureEntityName() {
    return this._featureEntityValue;
  }

  protected root_getFieldAliases() {
    return this._fieldAliases;
  }

  protected async root_batchGetManyByIds({
    dataIds,
    fields,
    withCondition,
  }: {
    dataIds: string[];
    fields: (keyof T)[] | undefined | null;
    withCondition?: IMocodyFieldCondition<T>;
  }) {
    if (!dataIds?.length) {
      return [];
    }
    const dataIdsUnique = UtilService.removeDuplicatesInArray(dataIds);

    if (dataIdsUnique.length === 1) {
      const result01 = await this.root_getOneById({
        dataId: dataIdsUnique[0],
        withCondition,
      });
      if (!result01) {
        return [];
      }
      if (fields?.length) {
        const result011 = UtilService.pickFromObject({ dataObject: result01, pickKeys: fields });
        return [result011];
      }
      return [result01];
    }

    return await this.root__mocodyBaseInstance().mocody_getManyByIds({
      dataIds: dataIdsUnique,
      fields,
      withCondition,
    });
  }

  protected async root_getOneById({
    dataId,
    withCondition,
  }: {
    dataId: string;
    withCondition?: IMocodyFieldCondition<T>;
  }) {
    this.root_util.validateRequiredString({ dataId });
    return await this.root__mocodyBaseInstance().mocody_getOneById({ dataId, withCondition });
  }

  protected async root_deleteById({
    dataId,
    withCondition,
  }: {
    dataId: string;
    withCondition?: IMocodyFieldCondition<T>;
  }) {
    this.root_util.validateRequiredString({ dataId });
    return await this.root__mocodyBaseInstance().mocody_deleteById({ dataId, withCondition });
  }
}
