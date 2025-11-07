import { DefinedIndexes } from "./base-constants.js";
import { RootRepository } from "./root-repository.js";
import { MyQueryBuilder } from "./base-query-builder.js";
export class BaseRepository extends RootRepository {
    constructor({ schemaSubDef, baseTableName, featureEntity, secondaryIndexOptions, strictRequiredFields, fieldAliases, }) {
        super({
            baseTableName,
            featureEntity,
            schemaSubDef,
            fieldAliases,
            strictRequiredFields: Array.from(new Set(strictRequiredFields)),
            secondaryIndexOptions: [
                ...secondaryIndexOptions,
                DefinedIndexes.featureEntity_createdAtDate,
                DefinedIndexes.featureEntity_recordDate,
                DefinedIndexes.targetId_featureEntity,
                DefinedIndexes.targetId_createdAtDate,
                DefinedIndexes.targetId_recordDate,
            ],
        });
    }
    _root__getBaseIndexes() {
        return {
            featureEntity_createdAtDate: DefinedIndexes.featureEntity_createdAtDate,
            featureEntity_recordDate: DefinedIndexes.featureEntity_recordDate,
            targetId_featureEntity: DefinedIndexes.targetId_featureEntity,
            targetId_createdAtDate: DefinedIndexes.targetId_createdAtDate,
            targetId_recordDate: DefinedIndexes.targetId_recordDate,
        };
    }
    root_queryBuilder(query) {
        return new MyQueryBuilder(query);
    }
    root_queryBuilder_private(query) {
        return new MyQueryBuilder(query);
    }
    async root_getWhere({ query, fields, limit, sortKeyParams, }) {
        if (sortKeyParams?.fieldName === "recordDate") {
            const { featureEntity_recordDate } = this._root__getBaseIndexes();
            const query01 = query || {};
            if (sortKeyParams) {
                delete query01[sortKeyParams.fieldName];
            }
            const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
                indexName: featureEntity_recordDate.indexName,
                partitionKeyValue: this.root_getFeatureEntityName(),
                sortKeyQuery: sortKeyParams?.query,
                query: query01,
                fields,
                limit,
                sort: sortKeyParams?.sort,
            });
            return result;
        }
        const { featureEntity_createdAtDate } = this._root__getBaseIndexes();
        const query01 = query || {};
        if (sortKeyParams) {
            delete query01[sortKeyParams.fieldName];
        }
        const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
            indexName: featureEntity_createdAtDate.indexName,
            partitionKeyValue: this.root_getFeatureEntityName(),
            sortKeyQuery: sortKeyParams?.query,
            query: query01,
            fields,
            limit,
            sort: sortKeyParams?.sort,
        });
        return result;
    }
    async root_getWherePaging({ query, fields, limit, sortKeyParams, nextPageHash, }) {
        if (sortKeyParams?.fieldName === "recordDate") {
            const { featureEntity_recordDate } = this._root__getBaseIndexes();
            const query01 = query || {};
            if (sortKeyParams) {
                delete query01[sortKeyParams.fieldName];
            }
            const result = await this.root__mocodyBaseInstance().mocody_getManyByIndexPaginate({
                indexName: featureEntity_recordDate.indexName,
                partitionKeyValue: this.root_getFeatureEntityName(),
                sortKeyQuery: sortKeyParams?.query,
                query: query01,
                fields,
                limit,
                sort: sortKeyParams?.sort,
                pagingParams: {
                    nextPageHash: nextPageHash || "",
                },
            });
            return result;
        }
        const { featureEntity_createdAtDate } = this._root__getBaseIndexes();
        const query01 = query || {};
        if (sortKeyParams) {
            delete query01[sortKeyParams.fieldName];
        }
        const result = await this.root__mocodyBaseInstance().mocody_getManyByIndexPaginate({
            indexName: featureEntity_createdAtDate.indexName,
            partitionKeyValue: this.root_getFeatureEntityName(),
            sortKeyQuery: sortKeyParams?.query,
            query: query01,
            fields,
            limit,
            sort: sortKeyParams?.sort,
            pagingParams: {
                nextPageHash: nextPageHash || "",
            },
        });
        return result;
    }
    async root_target_getWherePaging({ targetId, query, fields, nextPageHash, limit, evaluationLimit, sortKeyParams, }) {
        this.root_util.validateRequiredString({ targetId });
        if (sortKeyParams?.fieldName === "recordDate") {
            const { targetId_recordDate } = this._root__getBaseIndexes();
            const query01 = query || {};
            if (sortKeyParams) {
                delete query01[sortKeyParams.fieldName];
            }
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
        const { targetId_createdAtDate } = this._root__getBaseIndexes();
        const query01 = query || {};
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
    async root_target_getWhere({ targetId, query, fields, limit, sortKeyParams, }) {
        this.root_util.validateRequiredString({ targetId });
        if (sortKeyParams?.fieldName === "recordDate") {
            const { targetId_recordDate } = this._root__getBaseIndexes();
            const query01 = query || {};
            if (sortKeyParams) {
                delete query01[sortKeyParams.fieldName];
            }
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
        const { targetId_createdAtDate } = this._root__getBaseIndexes();
        const query01 = query || {};
        if (sortKeyParams) {
            delete query01[sortKeyParams.fieldName];
        }
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
    root_encodeDayOfBirthIndexValue({ dob_dayStamp }) {
        this.root_util.validateDayStamp_YYYY_MM_DD({ dob_dayStamp });
        const [_, mm, dd] = dob_dayStamp.split("-");
        const mmdd = [mm, dd].join("-");
        return [this.root_getFeatureEntityName(), mmdd].join("::");
    }
    validateFieldAlias(data01) {
        const fieldAliaseData01 = super.root_getFieldAliases();
        if (fieldAliaseData01?.length && typeof data01 === "object") {
            fieldAliaseData01.forEach(([field01, field02]) => {
                if (data01[field01] !== data01[field02]) {
                    const fe = this.root_getFeatureEntityName();
                    throw this.root_util.createFriendlyValidationError(`Aliases mismatched for '${fe}'`);
                }
            });
        }
    }
    async base_createOne({ data, sessionUser }) {
        const data01 = this.base_formatNewData({ data, sessionUser });
        this.validateFieldAlias(data01);
        const result = await this.root__mocodyBaseInstance().mocody_createOne({
            data: data01,
        });
        return result;
    }
    base_formatNewData({ data, sessionUser }) {
        const now = new Date();
        const datePart = now.toISOString().split("T")[0];
        const dataMust = {
            createdAtDate: now.toISOString(),
            createdAtDayStamp: datePart,
        };
        if (sessionUser?.userId) {
            dataMust.creatorUserId = sessionUser.userId;
        }
        const dataSave01 = { ...data, ...dataMust };
        if (dataSave01.tagsCsv) {
            dataSave01.tagsCsv = dataSave01.tagsCsv.trim().toLowerCase();
        }
        if (!dataSave01.recordDate) {
            dataSave01.recordDate = datePart;
        }
        return dataSave01;
    }
    async base_formatForDump({ dataList }) {
        const dataList01 = dataList.map((data) => this._formatReadyDumpData({ data }));
        return await this.root__mocodyBaseInstance().mocody_formatForDump({ dataList: dataList01 });
    }
    async base_validateFormatData({ data }) {
        const data01 = this._formatReadyDumpData({ data });
        const result = await this.root__mocodyBaseInstance().mocody_validateFormatData({ data: data01 });
        return result;
    }
    _formatReadyDumpData({ data }) {
        const data01 = { ...data };
        this.root_util.validateRequiredString({ createdAtDate: data01.createdAtDate });
        const datePart = data01.createdAtDate?.split("T")[0];
        this.root_util.validateDayStamp_YYYY_MM_DD({ datePart });
        const dataMust = {
            createdAtDate: data01.createdAtDate,
            createdAtDayStamp: datePart,
        };
        const dataSave = { ...data01, ...dataMust };
        if (dataSave.tagsCsv) {
            dataSave.tagsCsv = dataSave.tagsCsv.trim().toLowerCase();
        }
        return dataSave;
    }
    async base_updateOne({ updateData, dataId, sessionUser, withCondition, }) {
        const dataMust = {
            lastModifiedDate: new Date().toISOString(),
        };
        if (sessionUser?.userId) {
            dataMust.lastModifierUserId = sessionUser.userId;
        }
        if (sessionUser?.tenantId) {
            withCondition = withCondition || [];
            withCondition.push({
                equals: sessionUser.tenantId,
                field: "tenantId",
            });
        }
        const finalData = { ...updateData, ...dataMust };
        this.validateFieldAlias(finalData);
        const result = await this.root__mocodyBaseInstance().mocody_updateOne({
            dataId,
            updateData: finalData,
            withCondition,
        });
        return result;
    }
    async root_getOneByCondition({ expensiveQuery, fields, }) {
        const { featureEntity_createdAtDate } = this._root__getBaseIndexes();
        const result = await this.root__mocodyBaseInstance().mocody_getManyByIndex({
            indexName: featureEntity_createdAtDate.indexName,
            partitionKeyValue: this.root_getFeatureEntityName(),
            query: expensiveQuery,
            fields,
            limit: 1,
        });
        if (result?.length) {
            return result[0];
        }
        return null;
    }
}
//# sourceMappingURL=base-repository.js.map