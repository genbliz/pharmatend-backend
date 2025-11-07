import { UtilService } from "@/services/util-service.js";
import { DefinedIndexes } from "./base-constants.js";
import { MyQueryBuilder } from "./base-query-builder.js";
import { BaseRepository } from "./base-repository.js";
import lodash from "lodash";
export class BaseTenantRepository extends BaseRepository {
    constructor({ schemaSubDef, baseTableName, secondaryIndexOptions, featureEntity, fieldAliases, strictRequiredFields, }) {
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
                DefinedIndexes.featureEntityTenantId_stringCode,
            ],
        });
    }
    _tenant_core_getIndexes() {
        return {
            featureEntityTenantId_createdAtDate: DefinedIndexes.featureEntityTenantId_createdAtDate,
            featureEntityTenantId_recordDate: DefinedIndexes.featureEntityTenantId_recordDate,
            featureEntityTenantId_numberCode: DefinedIndexes.featureEntityTenantId_numberCode,
            featureEntityTenantId_stringCode: DefinedIndexes.featureEntityTenantId_stringCode,
        };
    }
    base_getFeatureEntityTenantIdValue({ tenantId }) {
        this.root_util.validateRequiredString({ tenantId });
        return [this.root_getFeatureEntityName(), tenantId].join("::");
    }
    base_queryBuilder(query) {
        return new MyQueryBuilder(query);
    }
    async base_getWhere({ tenantId, query, fields, limit, sortKeyParams, }) {
        this.root_util.validateRequiredString({ tenantId });
        if (sortKeyParams?.fieldName === "recordDate") {
            const { featureEntityTenantId_recordDate } = this._tenant_core_getIndexes();
            const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
                indexName: featureEntityTenantId_recordDate.indexName,
                partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
                query: query,
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
                query: query,
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
                query: query,
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
            query: query,
            sortKeyQuery: sortKeyParams?.query,
            fields,
            limit,
            sort: sortKeyParams?.sort,
        });
        return result;
    }
    async base_getWherePaging({ tenantId, query, fields, nextPageHash, limit, evaluationLimit, sortKeyParams, }) {
        this.root_util.validateRequiredString({ tenantId });
        if (sortKeyParams?.fieldName === "numberCode") {
            const { featureEntityTenantId_numberCode } = this._tenant_core_getIndexes();
            const result = await this.root__mocodyBaseInstance().mocody_getManyByIndexPaginate({
                indexName: featureEntityTenantId_numberCode.indexName,
                partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
                sortKeyQuery: sortKeyParams?.query,
                query: query,
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
                query: query,
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
                query: query,
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
            query: query,
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
    async base_findCount({ tenantId, query, sortKeyParams, }) {
        this.root_util.validateRequiredString({ tenantId });
        if (sortKeyParams?.fieldName === "recordDate") {
            const { featureEntityTenantId_recordDate } = this._tenant_core_getIndexes();
            const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
                indexName: featureEntityTenantId_recordDate.indexName,
                partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
                query: query,
                fields: ["id"],
                sortKeyQuery: sortKeyParams?.query,
            });
            return (result || []).length;
        }
        const { featureEntityTenantId_createdAtDate } = this._tenant_core_getIndexes();
        const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
            indexName: featureEntityTenantId_createdAtDate.indexName,
            partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
            query: query,
            fields: ["id"],
            sortKeyQuery: sortKeyParams?.query,
        });
        return (result || []).length;
    }
    async base_getOneByTenantIdAndCondition({ tenantId, query, fields, sortKeyParams, }) {
        this.root_util.validateRequiredString({ tenantId });
        if (sortKeyParams?.fieldName === "recordDate") {
            const { featureEntityTenantId_recordDate } = this._tenant_core_getIndexes();
            const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
                indexName: featureEntityTenantId_recordDate.indexName,
                partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
                sortKeyQuery: sortKeyParams.query,
                query: query,
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
            query: query,
            fields,
            limit: 1,
        });
        if (result?.length) {
            return result[0];
        }
        return null;
    }
    async base_searchByTags({ tagName, tenantId, fields, query, }) {
        this.root_util.validateRequiredString({ tagName, tenantId });
        const query01 = this.root_queryBuilder_private();
        if (query) {
            query01.addQuery({ ...query });
        }
        query01.addQuery({ tagsCsv: { $contains: tagName } });
        const { featureEntityTenantId_createdAtDate } = this._tenant_core_getIndexes();
        const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
            indexName: featureEntityTenantId_createdAtDate.indexName,
            partitionKeyValue: this.base_getFeatureEntityTenantIdValue({ tenantId }),
            fields,
            query: query01.buildQuery(),
        });
        return result;
    }
    async base_getOneByIdAndTenantId({ dataId, tenantId, fields, }) {
        this.root_util.validateRequiredString({ dataId, tenantId });
        const result01 = await super.root_getOneById({
            dataId,
            withCondition: [
                {
                    field: "tenantId",
                    equals: tenantId,
                },
            ],
        });
        if (result01 && fields?.length) {
            const plainResult = UtilService.convertObjectToJsonPlainObject(result01);
            return UtilService.pickFromObject({ dataObject: plainResult, pickKeys: fields });
        }
        return result01;
    }
    base_deleteByIdAndTenantId({ dataId, tenantId }) {
        this.root_util.validateRequiredString({ dataId, tenantId });
        return super.root_deleteById({
            dataId,
            withCondition: [
                {
                    field: "tenantId",
                    equals: tenantId,
                },
            ],
        });
    }
    base_deleteOne({ dataId, sessionUser }) {
        this.root_util.validateRequiredString({
            dataId,
            tenantId: sessionUser.tenantId,
        });
        return super.root_deleteById({
            dataId,
            withCondition: [
                {
                    field: "tenantId",
                    equals: sessionUser.tenantId,
                },
            ],
        });
    }
    async base_getManyByIdsAndTenantId({ dataIds, fields, tenantId, }) {
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
                    field: "tenantId",
                    equals: tenantId,
                },
            ],
        });
    }
    async base_createOne({ data, sessionUser }) {
        if (sessionUser?.tenantId) {
            data.tenantId = sessionUser.tenantId;
        }
        this.root_util.validateRequiredString({ tenantId: data.tenantId });
        const dataToSave = { ...data };
        const featureEntityTenantId = this.base_getFeatureEntityTenantIdValue({
            tenantId: dataToSave.tenantId,
        });
        this.root_util.validateRequiredString({ featureEntityTenantId });
        dataToSave.featureEntityTenantId = featureEntityTenantId;
        return super.base_createOne({
            data: dataToSave,
            sessionUser,
        });
    }
    async base_updateOne({ updateData, dataId, sessionUser, withCondition, enableDataLockCheck, }) {
        const dataToUpdate = { ...updateData };
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
            updateData: dataToUpdate,
            dataId,
            sessionUser,
            withCondition,
        });
    }
    async base_formatForDump({ dataList }) {
        const resultDump = [];
        const bulkItemChunked = lodash.chunk(dataList, 1000);
        for (const dataListItem of bulkItemChunked) {
            const dataList01 = dataListItem.map((data01) => {
                return this._base_formatValidateData({ data: data01 });
            });
            const dataItem = await super.base_formatForDump({ dataList: [...dataList01] });
            resultDump.push(...dataItem);
        }
        return resultDump;
    }
    async base_validateFormatData({ data }) {
        const data01 = this._base_formatValidateData({ data: data });
        return await super.base_validateFormatData({ data: data01 });
    }
    _base_formatValidateData({ data }) {
        this.root_util.validateRequiredString({
            tenantId: data.tenantId,
        });
        const dataToSave = { ...data };
        const featureEntityTenantId = this.base_getFeatureEntityTenantIdValue({
            tenantId: dataToSave.tenantId,
        });
        dataToSave.featureEntityTenantId = featureEntityTenantId;
        this.root_util.validateRequiredString({
            featureEntityTenantId: dataToSave.featureEntityTenantId,
        });
        return dataToSave;
    }
    async base_checkValidateDataLock({ sessionUser, enableDataLockCheck, dataId, }) {
        if (enableDataLockCheck && sessionUser?.tenantId) {
            const resultData = (await this.base_getOneByIdAndTenantId({
                dataId,
                tenantId: sessionUser.tenantId,
                fields: undefined,
            }));
            if (resultData?.createdAtDate) {
                await this.root_util.helper_ValidateDataEditLock({
                    sessionUser,
                    createdAtDate: resultData.createdAtDate,
                });
            }
        }
    }
}
//# sourceMappingURL=base-tenant-repository.js.map