import { LoggingService } from "@/services/logging-service.js";
import { RemoteParentService } from "@/remote/parent/remote-parent-service.js";
import { CachedDataRepository } from "../cached-data/cached-data-repository.js";
import { ITenant, ISuperAdminRemoteLoginResult, ISuperAdministrator } from "./admin-types.js";
import { ISessionUser } from "../auth/auth-types.js";
import { DateService } from "@/services/date-service.js";
import { BaseErrorHelperUtils } from "@/core/base-error-helper-utils.js";
import { CommonConfig } from "../../config/config-common.js";
import { CreateFriendlyError } from "../../helper/response-model.js";

class AdminServiceBase extends BaseErrorHelperUtils {
  private readonly cacheCategoryTenant = "3b9b793dce41b165fe0a05196b09cdd5c";
  private readonly cacheCategoryAdminUser = "7b809bb252f26fe3ddbf4f2907c02d794";

  async getCachedTenant_ByTenantId({ tenantId }: { tenantId: string }) {
    if (!tenantId) {
      return null;
    }
    const cached = await CachedDataRepository.getByTargetId<ITenant>({
      targetId: tenantId,
      category: this.cacheCategoryTenant,
    });
    return cached;
  }

  async getCachedTenant_ByTenantIds({ tenantIds }: { tenantIds: string[] }) {
    if (!tenantIds?.length) {
      return [];
    }
    const cached = await CachedDataRepository.getByTargetIds<ITenant>({
      targetIds: tenantIds,
      category: this.cacheCategoryTenant,
    });
    return cached ?? [];
  }

  async getCachedTenant_ByShortCode(shortCode: number) {
    if (!shortCode) {
      return null;
    }
    const cachedTenant = await CachedDataRepository.getByTargetId<ITenant>({
      targetId: shortCode.toString(),
      category: this.cacheCategoryTenant,
    });
    if (cachedTenant?.id && cachedTenant.shortCode === shortCode) {
      return cachedTenant;
    }
    return null;
  }

  async getCachedAdminUserById(adminUserId: string): Promise<ISuperAdministrator | null> {
    if (!adminUserId) {
      return null;
    }
    const cachedAdminUser = await CachedDataRepository.getByTargetId<ISuperAdministrator>({
      targetId: adminUserId,
      category: this.cacheCategoryAdminUser,
    });
    if (cachedAdminUser?.id === adminUserId) {
      return cachedAdminUser;
    }
    return null;
  }

  async isAdministratorUser({ sessionUser }: { sessionUser: ISessionUser }): Promise<boolean> {
    if (!sessionUser?.userId) {
      return false;
    }
    const cachedAdminUser = await this.getCachedAdminUserById(sessionUser.userId);
    if (cachedAdminUser?.id) {
      return true;
    }
    return false;
  }

  private async createCacheData(loginResult: ISuperAdminRemoteLoginResult) {
    try {
      if (!(loginResult?.user?.id && loginResult?.tenant?.id)) {
        return;
      }
      let expireAt: Date;
      const defaultExpireDate = DateService.addMinutes({
        date: new Date(),
        minutes: CommonConfig.DATA_CACHE_PERIOD_IN_MUNITES,
      });

      if (loginResult?.license?.expireAt && DateService.isDate(loginResult.license.expireAt)) {
        const systemExpireDate = new Date(loginResult.license.expireAt);
        const extendedExpireDate = DateService.addMonths({ date: new Date(), months: 1 });
        //
        if (systemExpireDate > defaultExpireDate && systemExpireDate > extendedExpireDate) {
          expireAt = extendedExpireDate;
        } else {
          expireAt = systemExpireDate;
        }
      } else {
        expireAt = defaultExpireDate;
      }

      await CachedDataRepository.createCache({
        targetId: loginResult.tenant.id,
        category: this.cacheCategoryTenant,
        dataObj: loginResult.tenant,
        expireAt,
      });
      if (loginResult.tenant.shortCode) {
        await CachedDataRepository.createCache({
          targetId: loginResult.tenant.shortCode.toString(),
          category: this.cacheCategoryTenant,
          dataObj: loginResult.tenant,
          expireAt,
        });
      }
      await CachedDataRepository.createCache({
        targetId: loginResult.user.id,
        category: this.cacheCategoryAdminUser,
        dataObj: loginResult.user,
        expireAt,
      });
    } catch (error) {
      LoggingService.logConsoleError({ adminUserRemoteLogin_CACHE_ERROR: error });
    }
  }

  async adminUserRemoteLogin({
    email,
    password,
    shortCode,
  }: {
    email: string;
    password: string;
    shortCode: number;
  }): Promise<ISuperAdminRemoteLoginResult> {
    this.validateRequiredEmail({ email });
    this.validateRequiredString({ password });
    this.validateRequiredNumber({ shortCode });

    const loginResult = await RemoteParentService.adminUserRemoteLogin({
      email,
      password,
      shortCode,
    });

    if (!(loginResult?.user?.id && loginResult?.tenant?.id)) {
      throw CreateFriendlyError("Invalid Admin login data");
    }

    if (!loginResult?.license?.valid) {
      throw CreateFriendlyError("Inavlid Tenant License");
    }

    await this.createCacheData(loginResult);
    return loginResult;
  }
}

export const AdminService = new AdminServiceBase();
