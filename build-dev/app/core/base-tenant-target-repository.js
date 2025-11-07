import { DefinedIndexes } from "./base-constants.js";
import { MyQueryBuilder } from "./base-query-builder.js";
import { BaseTenantRepository } from "./base-tenant-repository.js";
export class BaseTenantTargetRepository extends BaseTenantRepository {
    constructor({ schemaSubDef, featureEntity, strictRequiredFields, baseTableName, fieldAliases }) {
        super({
            schemaSubDef,
            featureEntity,
            fieldAliases,
            strictRequiredFields: [...strictRequiredFields, "targetId"],
            secondaryIndexOptions: [
                DefinedIndexes.targetId_featureEntity,
                DefinedIndexes.targetId_createdAtDate,
                DefinedIndexes.targetId_recordDate,
            ],
            baseTableName,
        });
    }
    _tenant_target_core_getIndexes() {
        return {
            targetId_featureEntity: DefinedIndexes.targetId_featureEntity,
            targetId_createdAtDate: DefinedIndexes.targetId_createdAtDate,
            targetId_recordDate: DefinedIndexes.targetId_recordDate,
        };
    }
    base_target_queryBuilder(query) {
        return new MyQueryBuilder(query);
    }
    async base_createOne({ data, sessionUser }) {
        const dataSave = { ...data };
        this.root_util.validateRequiredString({ targetId: dataSave.targetId });
        return super.base_createOne({
            data: dataSave,
            sessionUser,
        });
    }
    async base_target_getWherePaging({ tenantId, targetId, query, fields, nextPageHash, limit, evaluationLimit, sortKeyParams, }) {
        this.root_util.validateRequiredString({ targetId, tenantId });
        if (sortKeyParams?.fieldName === "recordDate") {
            const { targetId_recordDate } = this._tenant_target_core_getIndexes();
            const query01 = { ...query, tenantId };
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
        const query01 = { ...query, tenantId };
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
    async base_getManyByTenantIdAndTargetIdWithCondition({ tenantId, targetId, query, fields, limit, }) {
        this.root_util.validateRequiredString({ tenantId, targetId });
        const { targetId_featureEntity } = this._tenant_target_core_getIndexes();
        const query01 = { ...query, tenantId };
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
    async base_target_getWhere({ tenantId, targetId, query, fields, limit, sortKeyParams, }) {
        this.root_util.validateRequiredString({ tenantId, targetId });
        if (sortKeyParams?.fieldName === "recordDate") {
            const { targetId_recordDate } = this._tenant_target_core_getIndexes();
            const query01 = { ...query, tenantId };
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
        const query01 = { ...query, tenantId };
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
    async base_target_getWithRelationPaging({ tenantId, targetId, query, fields, nextPageHash, limit, evaluationLimit, sortKeyParams, }) {
        this.root_util.validateRequiredString({ targetId, tenantId });
        if (sortKeyParams?.fieldName === "recordDate") {
            const { targetId_recordDate } = this._tenant_target_core_getIndexes();
            const query01 = { ...query, tenantId };
            delete query01[sortKeyParams.fieldName];
            const result = await this.root__mocodyBaseInstance().mocody_getManyWithRelationPaginate({
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
        const query01 = { ...query, tenantId };
        if (sortKeyParams) {
            delete query01[sortKeyParams.fieldName];
        }
        const result = await this.root__mocodyBaseInstance().mocody_getManyWithRelationPaginate({
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
    async base_target_getWithRelation({ tenantId, targetId, query, fields, limit, sortKeyParams, }) {
        this.root_util.validateRequiredString({ tenantId, targetId });
        if (sortKeyParams?.fieldName === "recordDate") {
            const { targetId_recordDate } = this._tenant_target_core_getIndexes();
            const query01 = { ...query, tenantId };
            const result = await this.root__mocodyBaseInstance().mocody_getManyWithRelation({
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
        const query01 = { ...query, tenantId };
        if (sortKeyParams) {
            delete query01[sortKeyParams.fieldName];
        }
        const result = await this.root__mocodyBaseInstance().mocody_getManyWithRelation({
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
    async base_getOneByTenantIdAndTargetIdWithCondition({ tenantId, targetId, query, fields, }) {
        this.root_util.validateRequiredString({ tenantId, targetId });
        const { targetId_featureEntity } = this._tenant_target_core_getIndexes();
        const query01 = { ...query, tenantId };
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
//# sourceMappingURL=base-tenant-target-repository.js.map