import { UtilService } from "@/services/util-service.js";
import { CouchDataOperation, } from "mocody";
import { BaseHelperUtils } from "./base-error-helper-utils.js";
import { BaseConnections } from "./base-connections.js";
import { CreateFriendlyError } from "../helper/response-model.js";
import { UniqueIdGeneratorService } from "../services/unique-id-generator-service.js";
const tableNamesObj = {};
function checkDuplicate(tableName) {
    if (tableNamesObj[tableName]) {
        tableNamesObj[tableName] = tableNamesObj[tableName] + 1;
    }
    else {
        tableNamesObj[tableName] = 1;
    }
    if (tableNamesObj[tableName] > 1) {
        throw CreateFriendlyError(`Duplicated table name: '${tableName}'`);
    }
}
export class RootRepository {
    root_util = new BaseHelperUtils();
    _mocodyBaseCouch;
    _mocodyBasePouch;
    _featureEntityValue;
    _fieldAliases;
    constructor({ schemaSubDef, featureEntity, strictRequiredFields, secondaryIndexOptions, baseTableName, fieldAliases, }) {
        this._mocodyBaseCouch = new CouchDataOperation({
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
    async root_createIndexes() {
        if (this._mocodyBaseCouch) {
            const createIndexResult = await this._mocodyBaseCouch.mocody_tableManager().mocody_createDefinedIndexes();
            const createdIdexes = await this._mocodyBaseCouch.mocody_tableManager().mocody_getIndexes();
            console.log(JSON.stringify({ createdIdexes, createIndexResult }, null, 2));
        }
    }
    root__mocodyBaseInstance() {
        if (this._mocodyBaseCouch) {
            return this._mocodyBaseCouch;
        }
        if (this._mocodyBasePouch) {
            return this._mocodyBasePouch;
        }
        throw this.root_util.createFriendlyError("Db Instance not initialized");
    }
    root_getFeatureEntityName() {
        return this._featureEntityValue;
    }
    root_getFieldAliases() {
        return this._fieldAliases;
    }
    async root_batchGetManyByIds({ dataIds, fields, withCondition, }) {
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
    async root_getOneById({ dataId, withCondition, }) {
        this.root_util.validateRequiredString({ dataId });
        return await this.root__mocodyBaseInstance().mocody_getOneById({ dataId, withCondition });
    }
    async root_deleteById({ dataId, withCondition, }) {
        this.root_util.validateRequiredString({ dataId });
        return await this.root__mocodyBaseInstance().mocody_deleteById({ dataId, withCondition });
    }
}
//# sourceMappingURL=root-repository.js.map