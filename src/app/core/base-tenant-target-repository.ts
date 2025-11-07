import { ISessionUser } from "@/account/auth/auth-types.js";
import Joi from "joi";
import { IMocodyKeyConditionParams, IMocodyQueryDefinition } from "mocody";
import { DefinedIndexes } from "@/core/base-constants.js";
import { MyQueryBuilder } from "@/core/base-query-builder.js";
import { BaseTenantRepository } from "@/core/base-tenant-repository.js";
import { ICoreEntityTargetModel, IDataSortKey, IFieldAliases } from "@/core/base-types.js";

interface ICoreRepoOptions<T> {
  schemaSubDef: Joi.SchemaMap;
  featureEntity: string;
  strictRequiredFields: (keyof T)[];
  baseTableName: string;
  fieldAliases: IFieldAliases<T>;
}

type Paging = "tenantId" | "featureEntityTenantId" | "featureEntity" | "targetId" | "createdAtDate" | "recordDate";
type Relation = "tenantId" | "featureEntityTenantId" | "targetId" | "createdAtDate" | "recordDate";
type IManyQueryType01<T> = Omit<T, Paging>;
type IManyQueryRelationType<T> = Omit<T, Relation>;
type IManyQueryType02<T> = Omit<T, "tenantId" | "featureEntityTenantId" | "featureEntity" | "targetId">;

export abstract class BaseTenantTargetRepository<T extends ICoreEntityTargetModel> extends BaseTenantRepository<T> {
  constructor({ schemaSubDef, featureEntity, strictRequiredFields, baseTableName, fieldAliases }: ICoreRepoOptions<T>) {
    super({
      schemaSubDef,
      featureEntity,
      fieldAliases,
      strictRequiredFields: [...strictRequiredFields, "targetId"] as (keyof T)[],
      secondaryIndexOptions: [
        DefinedIndexes.targetId_featureEntity,
        DefinedIndexes.targetId_createdAtDate,
        DefinedIndexes.targetId_recordDate,
        //
      ],
      baseTableName,
    });
  }

  private _tenant_target_core_getIndexes() {
    return {
      targetId_featureEntity: DefinedIndexes.targetId_featureEntity,
      targetId_createdAtDate: DefinedIndexes.targetId_createdAtDate,
      targetId_recordDate: DefinedIndexes.targetId_recordDate,
    } as const;
  }

  base_target_queryBuilder(query?: IMocodyQueryDefinition<IManyQueryType01<T>>) {
    return new MyQueryBuilder<IManyQueryType01<T>>(query);
  }

  protected async base_createOne({ data, sessionUser }: { data: T; sessionUser: ISessionUser }) {
    const dataSave: T & { targetId: string; tenantId: string } = { ...data } as any;
    this.root_util.validateRequiredString({ targetId: dataSave.targetId });
    return super.base_createOne({
      data: dataSave,
      sessionUser,
    });
  }

  async base_target_getWherePaging({
    tenantId,
    targetId,
    query,
    fields,
    nextPageHash,
    limit,
    evaluationLimit,
    sortKeyParams,
  }: {
    tenantId: string;
    targetId: string;
    query?: IMocodyQueryDefinition<IManyQueryType01<T>>;
    fields: (keyof T)[] | undefined | null;
    nextPageHash: string | undefined | null;
    limit?: number;
    evaluationLimit?: number;
    sortKeyParams?: {
      query?: IMocodyKeyConditionParams<string>;
      sort?: IDataSortKey | null | undefined;
      fieldName: "createdAtDate" | "recordDate";
    };
  }) {
    this.root_util.validateRequiredString({ targetId, tenantId });

    if (sortKeyParams?.fieldName === "recordDate") {
      const { targetId_recordDate } = this._tenant_target_core_getIndexes();

      const query01: any = { ...query, tenantId };

      delete query01[sortKeyParams.fieldName];

      const result = await this.root__mocodyBaseInstance().mocody_getManyByIndexPaginate({
        indexName: targetId_recordDate.indexName,
        partitionKeyValue: targetId,
        query: query01,
        fields,
        limit,
        sortKeyQuery: sortKeyParams.query,
        pagingParams: {
          nextPageHash: nextPageHash || "",
          evaluationLimit,
        },
        sort: sortKeyParams?.sort,
      });
      return result;
    }

    const { targetId_createdAtDate } = this._tenant_target_core_getIndexes();

    const query01: any = { ...query, tenantId };

    if (sortKeyParams) {
      delete query01[sortKeyParams.fieldName];
    }

    const result = await this.root__mocodyBaseInstance().mocody_getManyByIndexPaginate({
      indexName: targetId_createdAtDate.indexName,
      partitionKeyValue: targetId,
      query: query01,
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

  async base_getManyByTenantIdAndTargetIdWithCondition({
    tenantId,
    targetId,
    query,
    fields,
    limit,
  }: {
    tenantId: string;
    targetId: string;
    query?: IMocodyQueryDefinition<IManyQueryType02<T>>;
    fields: (keyof T)[] | undefined | null;
    limit?: number;
  }) {
    this.root_util.validateRequiredString({ tenantId, targetId });

    const { targetId_featureEntity } = this._tenant_target_core_getIndexes();

    const query01: any = { ...query, tenantId };

    const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
      indexName: targetId_featureEntity.indexName,
      partitionKeyValue: targetId,
      query: query01,
      fields,
      limit,
      sortKeyQuery: { $eq: this.root_getFeatureEntityName() },
    });
    return result;
  }

  async base_target_getWhere({
    tenantId,
    targetId,
    query,
    fields,
    limit,
    sortKeyParams,
  }: {
    tenantId: string;
    targetId: string;
    query?: IMocodyQueryDefinition<IManyQueryType01<T>>;
    fields: (keyof T)[] | undefined | null;
    limit?: number;
    sortKeyParams?: {
      query?: IMocodyKeyConditionParams<string>;
      sort?: IDataSortKey | null | undefined;
      fieldName: "createdAtDate" | "recordDate";
    };
  }) {
    this.root_util.validateRequiredString({ tenantId, targetId });

    if (sortKeyParams?.fieldName === "recordDate") {
      const { targetId_recordDate } = this._tenant_target_core_getIndexes();

      const query01: any = { ...query, tenantId };

      const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
        indexName: targetId_recordDate.indexName,
        partitionKeyValue: targetId,
        sortKeyQuery: sortKeyParams?.query,
        query: query01,
        fields,
        limit,
        sort: sortKeyParams?.sort,
      });
      return result;
    }

    const { targetId_createdAtDate } = this._tenant_target_core_getIndexes();

    const query01: any = { ...query, tenantId };

    const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
      indexName: targetId_createdAtDate.indexName,
      partitionKeyValue: targetId,
      sortKeyQuery: sortKeyParams?.query,
      query: query01,
      fields,
      limit,
      sort: sortKeyParams?.sort,
    });
    return result;
  }

  async base_target_getWithRelationPaging<TQuery, TData>({
    tenantId,
    targetId,
    query,
    fields,
    nextPageHash,
    limit,
    evaluationLimit,
    sortKeyParams,
  }: {
    tenantId: string;
    targetId: string;
    query?: IMocodyQueryDefinition<IManyQueryRelationType<TQuery>>;
    fields: (keyof TQuery)[] | undefined;
    nextPageHash: string | undefined | null;
    limit?: number;
    evaluationLimit?: number;
    sortKeyParams?: {
      query?: IMocodyKeyConditionParams<string>;
      sort?: IDataSortKey | null | undefined;
      fieldName: "createdAtDate" | "recordDate";
    };
  }) {
    this.root_util.validateRequiredString({ targetId, tenantId });

    if (sortKeyParams?.fieldName === "recordDate") {
      const { targetId_recordDate } = this._tenant_target_core_getIndexes();

      const query01: any = { ...query, tenantId };

      delete query01[sortKeyParams.fieldName];

      const result = await this.root__mocodyBaseInstance().mocody_getManyWithRelationPaginate<TQuery, TData>({
        indexName: targetId_recordDate.indexName,
        partitionKeyValue: targetId,
        query: query01,
        fields,
        limit,
        sortKeyQuery: sortKeyParams.query,
        pagingParams: {
          nextPageHash: nextPageHash || "",
          evaluationLimit,
        },
        sort: sortKeyParams?.sort,
      });
      return result;
    }

    const { targetId_createdAtDate } = this._tenant_target_core_getIndexes();

    const query01: any = { ...query, tenantId };

    if (sortKeyParams) {
      delete query01[sortKeyParams.fieldName];
    }

    const result = await this.root__mocodyBaseInstance().mocody_getManyWithRelationPaginate<TQuery, TData>({
      indexName: targetId_createdAtDate.indexName,
      partitionKeyValue: targetId,
      query: query01,
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

  async base_target_getWithRelation<TQuery = unknown, TData = unknown>({
    tenantId,
    targetId,
    query,
    fields,
    limit,
    sortKeyParams,
  }: {
    tenantId: string;
    targetId: string;
    query: IMocodyQueryDefinition<IManyQueryRelationType<TQuery>>;
    fields: (keyof TQuery)[] | undefined;
    limit?: number;
    sortKeyParams?: {
      query?: IMocodyKeyConditionParams<string>;
      sort?: IDataSortKey | null | undefined;
      fieldName: "createdAtDate" | "recordDate";
    };
  }) {
    this.root_util.validateRequiredString({ tenantId, targetId });

    if (sortKeyParams?.fieldName === "recordDate") {
      const { targetId_recordDate } = this._tenant_target_core_getIndexes();

      const query01: any = { ...query, tenantId };

      const result = await this.root__mocodyBaseInstance().mocody_getManyWithRelation<TQuery, TData>({
        indexName: targetId_recordDate.indexName,
        partitionKeyValue: targetId,
        sortKeyQuery: sortKeyParams?.query,
        query: query01,
        fields,
        limit,
        sort: sortKeyParams?.sort,
      });
      return result;
    }

    const { targetId_createdAtDate } = this._tenant_target_core_getIndexes();

    const query01: any = { ...query, tenantId };

    if (sortKeyParams) {
      delete query01[sortKeyParams.fieldName];
    }

    const result = await this.root__mocodyBaseInstance().mocody_getManyWithRelation<TQuery, TData>({
      indexName: targetId_createdAtDate.indexName,
      partitionKeyValue: targetId,
      sortKeyQuery: sortKeyParams?.query,
      query: query01,
      fields,
      limit,
      sort: sortKeyParams?.sort,
    });
    return result;
  }

  async base_getOneByTenantIdAndTargetIdWithCondition({
    tenantId,
    targetId,
    query,
    fields,
  }: {
    tenantId: string;
    targetId: string;
    query?: IMocodyQueryDefinition<IManyQueryType02<T>>;
    fields: (keyof T)[] | undefined | null;
  }) {
    this.root_util.validateRequiredString({ tenantId, targetId });

    const { targetId_featureEntity } = this._tenant_target_core_getIndexes();

    const query01: any = { ...query, tenantId };

    const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
      indexName: targetId_featureEntity.indexName,
      partitionKeyValue: targetId,
      query: query01,
      fields,
      limit: 1,
      sortKeyQuery: { $eq: this.root_getFeatureEntityName() },
    });
    if (result?.length) {
      return result[0];
    }
    return null;
  }
}
