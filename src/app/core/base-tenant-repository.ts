import { UtilService } from "@/services/util-service.js";
import { ISessionUser } from "@/account/auth/auth-types.js";
import type {
  IMocodyFieldCondition,
  IMocodyIndexDefinition,
  IMocodyKeyConditionParams,
  IMocodyQueryDefinition,
} from "mocody";
import Joi from "joi";
import { DefinedIndexes } from "./base-constants.js";
import { MyQueryBuilder } from "./base-query-builder.js";
import { BaseRepository } from "./base-repository.js";
import type { ICoreEntityTenantModel, IDataSortKey } from "./base-types.js";
import lodash from "lodash";

interface ICoreRepoOptions<T> {
  schemaSubDef: Joi.SchemaMap;
  featureEntity: string;
  searchArgsFields?: (keyof T)[];
  strictRequiredFields: (keyof T)[];
  baseTableName: string;
  secondaryIndexOptions: IMocodyIndexDefinition<T>[];
  fieldAliases: [keyof T, keyof T][];
}

type IQueryIndexes = "tenantId" | "featureEntityTenantId" | "createdAtDate" | "recordDate" | "numberCode" | "shortCode";

type IManyQueryType<T> = Omit<T, IQueryIndexes>;

export abstract class BaseTenantRepository<T extends ICoreEntityTenantModel> extends BaseRepository<T> {
  constructor({
    schemaSubDef,
    baseTableName,
    secondaryIndexOptions,
    featureEntity,
    fieldAliases,
    strictRequiredFields,
  }: ICoreRepoOptions<T>) {
    super({
      schemaSubDef,
      baseTableName,
      featureEntity,
      fieldAliases,
      strictRequiredFields: [...strictRequiredFields, "tenantId", "featureEntityTenantId"],
      secondaryIndexOptions: [
        ...secondaryIndexOptions,
        DefinedIndexes.featureEntityTenantId_createdAtDate,
        DefinedIndexes.featureEntityTenantId_recordDate,
        DefinedIndexes.featureEntityTenantId_numberCode,
        DefinedIndexes.featureEntityTenantId_sk01,
      ],
    });
  }

  private _tenant_core_getIndexes() {
    return {
      featureEntityTenantId_createdAtDate: DefinedIndexes.featureEntityTenantId_createdAtDate,
      featureEntityTenantId_recordDate: DefinedIndexes.featureEntityTenantId_recordDate,
      featureEntityTenantId_numberCode: DefinedIndexes.featureEntityTenantId_numberCode,
      featureEntityTenantId_stringCode: DefinedIndexes.featureEntityTenantId_sk01,
    } as const;
  }

  protected base_getFeatureEntityTenantIdValue({ tenantId }: { tenantId: string }) {
    /* Do not change this once in production. Changing might result to wrong result */
    this.root_util.validateRequiredString({ tenantId });
    return [this.root_getFeatureEntityName(), tenantId].join("::");
  }

  base_queryBuilder(query?: IMocodyQueryDefinition<IManyQueryType<T>>) {
    return new MyQueryBuilder<IManyQueryType<T>>(query);
  }

  async base_getWhere({
    tenantId,
    query,
    fields,
    limit,
    sortKeyParams,
  }: {
    tenantId: string;
    query?: IMocodyQueryDefinition<IManyQueryType<T>>;
    fields: (keyof T)[] | undefined | null;
    limit?: number;
    sortKeyParams?:
      | {
          query?: IMocodyKeyConditionParams<string>;
          sort?: IDataSortKey | null | undefined;
          fieldName: "createdAtDate" | "recordDate";
        }
      | {
          query?: IMocodyKeyConditionParams<number>;
          sort?: IDataSortKey | null | undefined;
          fieldName: "numberCode";
        }
      | {
          query?: IMocodyKeyConditionParams<string>;
          sort?: IDataSortKey | null | undefined;
          fieldName: "stringCode";
        };
  }) {
    this.root_util.validateRequiredString({ tenantId });

    if (sortKeyParams?.fieldName === "recordDate") {
      const { featureEntityTenantId_recordDate } = this._tenant_core_getIndexes();

      const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
        indexName: featureEntityTenantId_recordDate.indexName,
        partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
        query: query as any,
        sortKeyQuery: sortKeyParams?.query,
        fields,
        limit,
        sort: sortKeyParams?.sort,
      });
      return result;
    }

    if (sortKeyParams?.fieldName === "numberCode") {
      const { featureEntityTenantId_numberCode } = this._tenant_core_getIndexes();
      const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
        indexName: featureEntityTenantId_numberCode.indexName,
        partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
        sortKeyQuery: sortKeyParams?.query,
        query: query as any,
        fields,
        limit,
        sort: sortKeyParams?.sort,
      });
      return result;
    }

    if (sortKeyParams?.fieldName === "stringCode") {
      const { featureEntityTenantId_stringCode } = this._tenant_core_getIndexes();

      const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
        indexName: featureEntityTenantId_stringCode.indexName,
        partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
        sortKeyQuery: sortKeyParams?.query,
        query: query as any,
        fields,
        limit,
        sort: sortKeyParams?.sort,
      });
      return result;
    }

    const { featureEntityTenantId_createdAtDate } = this._tenant_core_getIndexes();

    const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
      indexName: featureEntityTenantId_createdAtDate.indexName,
      partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
      query: query as any,
      sortKeyQuery: sortKeyParams?.query,
      fields,
      limit,
      sort: sortKeyParams?.sort,
    });
    return result;
  }

  async base_getWherePaging({
    tenantId,
    query,
    fields,
    nextPageHash,
    limit,
    evaluationLimit,
    sortKeyParams,
  }: {
    tenantId: string;
    query?: IMocodyQueryDefinition<IManyQueryType<T>>;
    fields: (keyof T)[] | undefined | null;
    nextPageHash: string | undefined | null;
    limit?: number;
    evaluationLimit?: number;
    sortKeyParams?:
      | {
          query?: IMocodyKeyConditionParams<string>;
          sort?: IDataSortKey | null | undefined;
          fieldName: "createdAtDate" | "recordDate";
        }
      | {
          query?: IMocodyKeyConditionParams<number>;
          sort?: IDataSortKey | null | undefined;
          fieldName: "numberCode";
        }
      | {
          query?: IMocodyKeyConditionParams<string>;
          sort?: IDataSortKey | null | undefined;
          fieldName: "stringCode";
        };
  }) {
    this.root_util.validateRequiredString({ tenantId });

    if (sortKeyParams?.fieldName === "numberCode") {
      const { featureEntityTenantId_numberCode } = this._tenant_core_getIndexes();
      const result = await this.root__mocodyBaseInstance().mocody_getManyByIndexPaginate({
        indexName: featureEntityTenantId_numberCode.indexName,
        partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
        sortKeyQuery: sortKeyParams?.query,
        query: query as any,
        pagingParams: {
          nextPageHash: nextPageHash || "",
        },
        fields,
        limit,
        sort: sortKeyParams?.sort,
      });
      return result;
    }

    if (sortKeyParams?.fieldName === "stringCode") {
      const { featureEntityTenantId_stringCode } = this._tenant_core_getIndexes();
      const result = await this.root__mocodyBaseInstance().mocody_getManyByIndexPaginate({
        indexName: featureEntityTenantId_stringCode.indexName,
        partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
        sortKeyQuery: sortKeyParams?.query,
        query: query as any,
        pagingParams: {
          nextPageHash: nextPageHash || "",
        },
        fields,
        limit,
        sort: sortKeyParams?.sort,
      });
      return result;
    }

    if (sortKeyParams?.fieldName === "recordDate") {
      const { featureEntityTenantId_recordDate } = this._tenant_core_getIndexes();

      const result = await this.root__mocodyBaseInstance().mocody_getManyByIndexPaginate({
        indexName: featureEntityTenantId_recordDate.indexName,
        partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
        query: query as any,
        fields,
        limit,
        sortKeyQuery: sortKeyParams?.query,
        pagingParams: {
          nextPageHash: nextPageHash || "",
          evaluationLimit,
        },
        sort: sortKeyParams?.sort,
      });
      return result;
    }

    const { featureEntityTenantId_createdAtDate } = this._tenant_core_getIndexes();

    const result = await this.root__mocodyBaseInstance().mocody_getManyByIndexPaginate({
      indexName: featureEntityTenantId_createdAtDate.indexName,
      partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
      query: query as any,
      fields,
      limit,
      sortKeyQuery: sortKeyParams?.query,
      pagingParams: {
        nextPageHash: nextPageHash || "",
        evaluationLimit,
      },
      sort: sortKeyParams?.sort,
    });
    return result;
  }

  protected async base_findCount({
    tenantId,
    query,
    sortKeyParams,
  }: {
    tenantId: string;
    query?: IMocodyQueryDefinition<IManyQueryType<T>>;
    sortKeyParams?: {
      query: IMocodyKeyConditionParams<string>;
      fieldName: "createdAtDate" | "recordDate";
    };
  }) {
    this.root_util.validateRequiredString({ tenantId });

    if (sortKeyParams?.fieldName === "recordDate") {
      const { featureEntityTenantId_recordDate } = this._tenant_core_getIndexes();

      const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
        indexName: featureEntityTenantId_recordDate.indexName,
        partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
        query: query as any,
        fields: ["id"],
        sortKeyQuery: sortKeyParams?.query,
      });
      return (result || []).length;
    }

    const { featureEntityTenantId_createdAtDate } = this._tenant_core_getIndexes();

    const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
      indexName: featureEntityTenantId_createdAtDate.indexName,
      partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
      query: query as any,
      fields: ["id"],
      sortKeyQuery: sortKeyParams?.query,
    });
    return (result || []).length;
  }

  protected async base_getOneByTenantIdAndCondition({
    tenantId,
    query,
    fields,
    sortKeyParams,
  }: {
    tenantId: string;
    query?: IMocodyQueryDefinition<IManyQueryType<T>>;
    fields: (keyof T)[] | undefined | null;
    sortKeyParams?: {
      query: IMocodyKeyConditionParams<string>;
      fieldName: "createdAtDate" | "recordDate";
    };
  }) {
    this.root_util.validateRequiredString({ tenantId });

    if (sortKeyParams?.fieldName === "recordDate") {
      const { featureEntityTenantId_recordDate } = this._tenant_core_getIndexes();

      const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
        indexName: featureEntityTenantId_recordDate.indexName,
        partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
        sortKeyQuery: sortKeyParams.query,
        query: query as any,
        fields,
        limit: 1,
      });
      if (result?.length) {
        return result[0];
      }
      return null;
    }

    const { featureEntityTenantId_createdAtDate } = this._tenant_core_getIndexes();

    const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
      indexName: featureEntityTenantId_createdAtDate.indexName,
      partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
      sortKeyQuery: sortKeyParams?.query,
      query: query as any,
      fields,
      limit: 1,
    });
    if (result?.length) {
      return result[0];
    }
    //
    return null;
  }

  protected async base_searchByTags({
    tagName,
    tenantId,
    fields,
    query,
  }: {
    tenantId: string;
    tagName: string;
    fields: (keyof T)[] | undefined | null;
    query?: IMocodyQueryDefinition<IManyQueryType<T>>;
  }) {
    this.root_util.validateRequiredString({ tagName, tenantId });

    const query01 = this.root_queryBuilder_private<ICoreEntityTenantModel>();

    if (query) {
      query01.addQuery({ ...query } as any);
    }

    query01.addQuery({ tagsCsv: { $contains: tagName } });

    const { featureEntityTenantId_createdAtDate } = this._tenant_core_getIndexes();

    const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
      indexName: featureEntityTenantId_createdAtDate.indexName,
      partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
      fields,
      query: query01.buildQuery() as any,
    });
    return result;
  }

  protected async base_getOneByIdAndTenantId({
    dataId,
    tenantId,
    fields,
  }: {
    dataId: string;
    tenantId: string;
    fields?: (keyof T)[] | undefined;
  }): Promise<T | null> {
    this.root_util.validateRequiredString({ dataId, tenantId });

    const result01 = await super.root_getOneById({
      dataId,
      withCondition: [
        {
          field: "tenantId" as keyof T,
          equals: tenantId,
        },
      ],
    });

    if (result01 && fields?.length) {
      const plainResult: any = UtilService.convertObjectToJsonPlainObject(result01);
      return UtilService.pickFromObject({ dataObject: plainResult, pickKeys: fields });
    }
    return result01;
  }

  protected base_deleteByIdAndTenantId({ dataId, tenantId }: { dataId: string; tenantId: string }) {
    this.root_util.validateRequiredString({ dataId, tenantId });
    return super.root_deleteById({
      dataId,
      withCondition: [
        {
          field: "tenantId" as keyof T,
          equals: tenantId,
        },
      ],
    });
  }

  protected base_deleteOne({ dataId, sessionUser }: { dataId: string; sessionUser: ISessionUser }) {
    this.root_util.validateRequiredString({
      dataId,
      tenantId: sessionUser.tenantId,
    });
    return super.root_deleteById({
      dataId,
      withCondition: [
        {
          field: "tenantId" as keyof T,
          equals: sessionUser.tenantId,
        },
      ],
    });
  }

  protected async base_getManyByIdsAndTenantId({
    dataIds,
    fields,
    tenantId,
  }: {
    dataIds: string[];
    fields: (keyof T)[] | undefined | null;
    tenantId: string;
  }) {
    if (!dataIds?.length) {
      return [];
    }
    this.root_util.validateRequiredString({ tenantId });

    for (const dataId of dataIds) {
      this.root_util.validateRequiredString({ dataId });
    }

    return super.root_batchGetManyByIds({
      dataIds,
      fields,
      withCondition: [
        {
          field: "tenantId" as keyof T,
          equals: tenantId,
        },
      ],
    });
  }

  protected async base_createOne({ data, sessionUser }: { data: T & { tenantId: string }; sessionUser: ISessionUser }) {
    if (sessionUser?.tenantId) {
      data.tenantId = sessionUser.tenantId;
    }
    this.root_util.validateRequiredString({ tenantId: data.tenantId });

    const dataToSave = { ...data } as unknown as ICoreEntityTenantModel;

    const featureEntityTenantId = this.base_getFeatureEntityTenantIdValue({
      tenantId: dataToSave.tenantId,
    });

    this.root_util.validateRequiredString({ featureEntityTenantId });

    dataToSave.featureEntityTenantId = featureEntityTenantId;

    return super.base_createOne({
      data: dataToSave as any,
      sessionUser,
    });
  }

  protected async base_updateOne({
    updateData,
    dataId,
    sessionUser,
    withCondition,
    enableDataLockCheck,
  }: {
    updateData: Partial<T>;
    dataId: string;
    sessionUser: ISessionUser;
    withCondition?: IMocodyFieldCondition<T>;
    enableDataLockCheck?: boolean;
  }) {
    const dataToUpdate = { ...updateData } as unknown as ICoreEntityTenantModel;

    this.root_util.validateRequiredString({ dataId, tenantId: dataToUpdate.tenantId });

    await this.base_checkValidateDataLock({
      sessionUser,
      dataId,
      enableDataLockCheck,
    });

    const featureEntityTenantId = this.base_getFeatureEntityTenantIdValue({
      tenantId: dataToUpdate.tenantId,
    });

    dataToUpdate.featureEntityTenantId = featureEntityTenantId;

    return super.base_updateOne({
      updateData: dataToUpdate as any,
      dataId,
      sessionUser,
      withCondition,
    });
  }

  async base_formatForDump({ dataList }: { dataList: T[] }) {
    const resultDump: string[] = [];

    const bulkItemChunked = lodash.chunk(dataList, 1000);

    for (const dataListItem of bulkItemChunked) {
      const dataList01: any[] = dataListItem.map((data01) => {
        return this._base_formatValidateData({ data: data01 as any });
      });
      const dataItem = await super.base_formatForDump({ dataList: [...dataList01] });
      resultDump.push(...dataItem);
    }
    return resultDump;
  }

  async base_validateFormatData({ data }: { data: T }) {
    const data01: any = this._base_formatValidateData({ data: data as any });
    return await super.base_validateFormatData({ data: data01 });
  }

  private _base_formatValidateData({ data }: { data: T & { tenantId: string } }) {
    this.root_util.validateRequiredString({
      tenantId: data.tenantId,
    });

    const dataToSave: ICoreEntityTenantModel = { ...data } as any;

    const featureEntityTenantId = this.base_getFeatureEntityTenantIdValue({
      tenantId: dataToSave.tenantId,
    });

    dataToSave.featureEntityTenantId = featureEntityTenantId;

    this.root_util.validateRequiredString({
      featureEntityTenantId: dataToSave.featureEntityTenantId,
    });

    return dataToSave;
  }

  protected async base_checkValidateDataLock({
    sessionUser,
    enableDataLockCheck,
    dataId,
  }: {
    sessionUser?: ISessionUser;
    enableDataLockCheck?: boolean;
    dataId: string;
  }) {
    if (enableDataLockCheck && sessionUser?.tenantId) {
      const resultData: ICoreEntityTenantModel & T = (await this.base_getOneByIdAndTenantId({
        dataId,
        tenantId: sessionUser.tenantId,
        fields: undefined,
      })) as any;
      if (resultData?.createdAtDate) {
        await this.root_util.helper_ValidateDataEditLock({
          sessionUser,
          createdAtDate: resultData.createdAtDate,
        });
      }
    }
  }
}
