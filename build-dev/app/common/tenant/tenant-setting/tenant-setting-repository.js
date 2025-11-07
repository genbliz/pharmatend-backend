import { TenantSettingModel } from "./tenant-setting-model.js";
import { CoreTenantRepository } from "@/core/core-tenant-repository.js";
class TenantSettingRepositoryBase extends CoreTenantRepository {
    constructor() {
        super({
            schemaSubDef: TenantSettingModel.getSchemaDef(),
            featureEntity: TenantSettingModel.getTableName(),
            fieldAliases: TenantSettingModel.getFieldAliases(),
            strictRequiredFields: [],
        });
    }
    getSettingWithTenantIds({ tenantIds, fields }) {
        return this.root_getWhere({
            query: {
                tenantId: { $in: tenantIds },
            },
            fields: fields || undefined,
        });
    }
    findSingle({ dataId, tenantId }) {
        return this.base_getOneByIdAndTenantId({
            dataId,
            tenantId,
            fields: undefined,
        });
    }
    async getTenantIdsThatAllowedStaffDailyBirthdayMsg() {
        const tenantIds = [];
        const tenants = await this.root_getWhere({
            query: {
                canSendStaffDailyBirthdayMessage: true,
            },
            fields: ["tenantId"],
        });
        if (tenants?.length) {
            tenants.forEach((c) => {
                if (c.tenantId) {
                    tenantIds.push(c.tenantId);
                }
            });
        }
        return tenantIds;
    }
    findSingleByTenantId({ tenantId }) {
        return this.base_getOneByTenantIdAndCondition({
            tenantId,
            fields: undefined,
        });
    }
    async save({ data, sessionUser }) {
        if (!sessionUser?.isAdmin) {
            const result = await this.findSingle({
                dataId: data.id,
                tenantId: sessionUser.tenantId,
            });
            data.dataEditLockPeriodInMunite = result?.dataEditLockPeriodInMunite;
        }
        return this.base_createOne({
            data,
            sessionUser,
        });
    }
    update({ data, sessionUser }) {
        return this.base_updateOne({
            dataId: data.id,
            updateData: data,
            sessionUser,
        });
    }
}
export const TenantSettingRepository = new TenantSettingRepositoryBase();
//# sourceMappingURL=tenant-setting-repository.js.map