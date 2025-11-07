import { UserLoginStatusEnum } from "./user-login-types.js";
import { DateService } from "@/services/date-service.js";
import { UserLoginModel } from "./user-login-model.js";
import { CoreTenantTargetTempRepository } from "@/core/core-tenant-target-temp-repository.js";
import { LoggingService } from "../../services/logging-service.js";
class UserLoginRepositoryBase extends CoreTenantTargetTempRepository {
    constructor() {
        super({
            schemaSubDef: UserLoginModel.getSchemaDef(),
            featureEntity: UserLoginModel.getTableName(),
            fieldAliases: UserLoginModel.getFieldAliases(),
            strictRequiredFields: [],
        });
    }
    async create({ tenantId, userId, status, remark, }) {
        try {
            const data = {
                tenantId,
                userId,
                status,
                remark,
                dangerouslyExpireAt: DateService.addDays({ date: new Date(), days: 60 }).toISOString(),
            };
            const data01 = await this.formatAndResolveAliases(data);
            await this.base_createOne({
                data: data01,
                sessionUser: { tenantId, userId },
            });
        }
        catch (error) {
            LoggingService.anyError(error);
        }
    }
    async formatAndResolveAliases(data) {
        const data01 = { ...data };
        data01.targetId = data01.userId;
        return data01;
    }
    async createFailed({ tenantId, userId, remark, }) {
        return await this.create({
            tenantId,
            userId,
            status: UserLoginStatusEnum.FAILED,
            remark,
        });
    }
    async createInvalidLicense({ tenantId, userId }) {
        return await this.create({
            tenantId,
            userId,
            status: UserLoginStatusEnum.INVALID_LICENSE,
        });
    }
    async createSucceed({ tenantId, userId }) {
        return await this.create({
            tenantId,
            userId,
            status: UserLoginStatusEnum.SUCCEEDED,
        });
    }
    async createLockout({ tenantId, userId }) {
        return await this.create({
            tenantId,
            userId,
            status: UserLoginStatusEnum.LOCKED_OUT,
            remark: "User locked out",
        });
    }
    async getLoginByStatusAgo({ tenantId, userId, loginStatus, minutesAgo, }) {
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
//# sourceMappingURL=user-login-repository.js.map