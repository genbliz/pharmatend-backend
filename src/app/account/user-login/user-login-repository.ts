import { IUserLogin, UserLoginStatusEnum } from "./user-login-types";
import { DateService } from "@/services/date-service";
import { UserLoginModel } from "./user-login-model";
import { CoreTenantTargetTempRepository } from "@/core/core-tenant-target-temp-repository";
import { ISessionUser } from "../auth/auth-types";
import { LoggingService } from "../../services/logging-service";

class UserLoginRepositoryBase extends CoreTenantTargetTempRepository<IUserLogin> {
  constructor() {
    super({
      schemaSubDef: UserLoginModel.getSchemaDef(),
      featureEntity: UserLoginModel.getTableName(),
      fieldAliases: UserLoginModel.getFieldAliases(),
      strictRequiredFields: [],
    });
  }

  private async create({
    tenantId,
    userId,
    status,
    remark,
  }: {
    tenantId: string;
    userId: string;
    status: UserLoginStatusEnum;
    remark?: string;
  }): Promise<void> {
    try {
      const data: IUserLogin = {
        tenantId,
        userId,
        status,
        remark,
        dangerouslyExpireAt: DateService.addDays({ date: new Date(), days: 60 }).toISOString(),
      } as IUserLogin;

      const data01 = await this.formatAndResolveAliases(data);

      await this.base_createOne({
        data: data01,
        sessionUser: { tenantId, userId } as ISessionUser,
      });
    } catch (error) {
      LoggingService.anyError(error);
    }
  }

  private async formatAndResolveAliases(data: IUserLogin) {
    const data01 = { ...data };
    data01.targetId = data01.userId;

    // do sometihing here
    return data01;
  }

  async createFailed({
    tenantId,
    userId,
    remark,
  }: {
    tenantId: string;
    userId: string;
    remark: string;
  }): Promise<void> {
    return await this.create({
      tenantId,
      userId,
      status: UserLoginStatusEnum.FAILED,
      remark,
    });
  }

  async createInvalidLicense({ tenantId, userId }: { tenantId: string; userId: string }): Promise<void> {
    return await this.create({
      tenantId,
      userId,
      status: UserLoginStatusEnum.INVALID_LICENSE,
    });
  }

  async createSucceed({ tenantId, userId }: { tenantId: string; userId: string }): Promise<void> {
    return await this.create({
      tenantId,
      userId,
      status: UserLoginStatusEnum.SUCCEEDED,
    });
  }

  async createLockout({ tenantId, userId }: { tenantId: string; userId: string }): Promise<void> {
    return await this.create({
      tenantId,
      userId,
      status: UserLoginStatusEnum.LOCKED_OUT,
      remark: "User locked out",
    });
  }

  async getLoginByStatusAgo({
    tenantId,
    userId,
    loginStatus,
    minutesAgo,
  }: {
    tenantId: string;
    userId: string;
    loginStatus: UserLoginStatusEnum;
    minutesAgo: number;
  }): Promise<IUserLogin[]> {
    const dateCheck = DateService.addMinutes({ date: new Date(), minutes: minutesAgo });

    return await this.base_target_getWhere({
      tenantId,
      targetId: userId,
      query: {
        status: loginStatus,
      },
      sortKeyParams: {
        query: { $lt: dateCheck.toISOString() },
        fieldName: "createdAtDate",
        sort: "desc",
      },
      fields: UserLoginModel.getLiteFields(),
    });
  }
}

export const UserLoginRepository = new UserLoginRepositoryBase();
