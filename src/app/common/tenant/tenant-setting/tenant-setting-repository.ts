import { TenantSettingModel } from "@/common/tenant/tenant-setting/tenant-setting-model.js";
import { ISessionUser } from "@/account/auth/auth-types.js";
import { CoreTenantRepository } from "@/core/core-tenant-repository.js";
import { ITenantSetting } from "@/common/tenant/tenant-setting/tenant-setting-types.js";

class TenantSettingRepositoryBase extends CoreTenantRepository<ITenantSetting> {
  constructor() {
    super({
      schemaSubDef: TenantSettingModel.getSchemaDef(),
      featureEntity: TenantSettingModel.getTableName(),
      fieldAliases: TenantSettingModel.getFieldAliases(),
      strictRequiredFields: [],
    });
  }

  getSettingWithTenantIds({ tenantIds, fields }: { tenantIds: string[]; fields?: (keyof ITenantSetting)[] }) {
    return this.root_getWhere({
      query: {
        tenantId: { $in: tenantIds },
      },
      fields: fields || undefined,
    });
  }

  findSingle({ dataId, tenantId }: { dataId: string; tenantId: string }) {
    return this.base_getOneByIdAndTenantId({
      dataId,
      tenantId,
      fields: undefined,
    });
  }

  async getTenantIdsThatAllowedStaffDailyBirthdayMsg() {
    const tenantIds: string[] = [];
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

  findSingleByTenantId({ tenantId }: { tenantId: string }) {
    return this.base_getOneByTenantIdAndCondition({
      tenantId,
      fields: undefined,
    });
  }

  async save({ data, sessionUser }: { data: ITenantSetting; sessionUser: ISessionUser }) {
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

  update({ data, sessionUser }: { data: ITenantSetting; sessionUser: ISessionUser }) {
    return this.base_updateOne({
      dataId: data.id,
      updateData: data,
      sessionUser,
    });
  }
}

export const TenantSettingRepository = new TenantSettingRepositoryBase();
