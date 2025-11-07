import { LoggingService } from "@/services/logging-service.js";
import { UtilService } from "@/services/util-service.js";
import { DateService } from "@/services/date-service.js";
import { CoreTempRepository } from "@/core/core-temp-repository.js";
import { CacheDataModel } from "./cached-data-model.js";
class CachedDataRepositoryBase extends CoreTempRepository {
    constructor() {
        super({
            schemaSubDef: CacheDataModel.getSchemaDef(),
            featureEntity: CacheDataModel.getTableName(),
            fieldAliases: CacheDataModel.getFieldAliases(),
            strictRequiredFields: ["dangerouslyExpireAt", "targetId"],
        });
    }
    encodeSurfixes = [
        "f409360dba8f93c056829c0471c9b52e$",
        "00998ecf84d41d8cd98f27eb204e9800#",
        "6e89130c1b3a3d245a382f67fc85fa39$",
        "b39704ba206162f924600068a2c916f4#",
    ];
    stripSurfix(data) {
        let data01 = data.slice(0);
        this.encodeSurfixes.forEach((suff) => {
            data01 = data01.replace(suff, "");
        });
        return data01;
    }
    async encodeCache(data) {
        const encToString = typeof data === "string" ? data : JSON.stringify(data);
        const dataEncoded = UtilService.toHex(encToString);
        const [encodeSurfixesShuffled] = UtilService.shuffleArray(this.encodeSurfixes);
        return Promise.resolve(`${dataEncoded}${encodeSurfixesShuffled}`);
    }
    async decodeCache(dataEncoded) {
        try {
            if (dataEncoded) {
                const dataEncodedStriped = this.stripSurfix(dataEncoded);
                const data = UtilService.fromHex(dataEncodedStriped);
                return Promise.resolve(data);
            }
            return null;
        }
        catch (error) {
            LoggingService.anyError(error);
            return null;
        }
    }
    async isDateControlEncFieldValid(dateControlEnc) {
        const expireDate = await this.decodeCache(dateControlEnc);
        if (expireDate && DateService.isDate(expireDate)) {
            const now = new Date();
            const myExpireDate01 = new Date(expireDate);
            if (myExpireDate01 > now) {
                return true;
            }
        }
        return false;
    }
    async getByTargetId({ targetId, category }) {
        const [data] = await this.root_target_getWhere({
            targetId,
            query: {
                category,
            },
            fields: undefined,
        });
        if (data?.dataEncoded && data.targetId === targetId) {
            const isValid = await this.isDateControlEncFieldValid(data.dateControlEnc);
            if (isValid) {
                const dataDecoded = await this.decodeCache(data.dataEncoded);
                if (dataDecoded) {
                    try {
                        const decodedParedData = JSON.parse(dataDecoded);
                        return decodedParedData;
                    }
                    catch (err) {
                        LoggingService.logConsoleError(err);
                        return null;
                    }
                }
            }
        }
        return null;
    }
    async getByTargetIds({ targetIds, category, }) {
        const dataList = await this.root_getWhere({
            query: {
                targetId: { $in: targetIds },
                category,
            },
            fields: undefined,
        });
        const returnDatalist = [];
        const targetIdsObj = {};
        targetIds.forEach((tenantId) => {
            targetIdsObj[tenantId] = tenantId;
        });
        for (const data of dataList) {
            if (data?.dataEncoded && targetIdsObj[data.targetId]) {
                const isValid = await this.isDateControlEncFieldValid(data.dateControlEnc);
                if (isValid) {
                    const dataDecoded = await this.decodeCache(data.dataEncoded);
                    if (dataDecoded) {
                        try {
                            returnDatalist.push(JSON.parse(dataDecoded));
                        }
                        catch (err) {
                            LoggingService.logConsoleError(err);
                        }
                    }
                }
            }
        }
        return returnDatalist;
    }
    async createCache({ targetId, category, dataObj, expireAt, }) {
        await this.deleteByTargetId({ targetId, category });
        const dataEncoded = await this.encodeCache(dataObj);
        const dateControlEnc = await this.encodeCache(expireAt.toISOString());
        const data = {
            targetId,
            category,
            dataEncoded,
            dangerouslyExpireAt: expireAt.toISOString(),
            dateControlEnc,
        };
        return await this.base_createOne({ data });
    }
    async deleteByTargetId({ targetId, category }) {
        const dataList = await this.root_target_getWhere({
            targetId,
            query: { category },
            fields: ["id"],
        });
        if (!dataList?.length) {
            return;
        }
        for (const data of dataList) {
            await this.root_deleteById({ dataId: data.id });
        }
    }
}
export const CachedDataRepository = new CachedDataRepositoryBase();
//# sourceMappingURL=cached-data-repository.js.map