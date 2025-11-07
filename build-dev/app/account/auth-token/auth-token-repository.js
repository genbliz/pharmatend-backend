import { EncryptionService } from "@/services/encryption-service.js";
import { UtilService } from "@/services/util-service.js";
import { DateService } from "@/services/date-service.js";
import { AuthTokenCategoryEnum } from "./auth-token-types.js";
import { AuthTokenModel } from "./auth-token-model.js";
import { CoreTempRepository } from "@/core/core-temp-repository.js";
class AuthTokenRepositoryBase extends CoreTempRepository {
    constructor() {
        super({
            schemaSubDef: AuthTokenModel.getSchemaDef(),
            featureEntity: AuthTokenModel.getTableName(),
            fieldAliases: AuthTokenModel.getFieldAliases(),
            strictRequiredFields: ["dangerouslyExpireAt", "targetId"],
        });
    }
    async getTokenCode() {
        const strData = [UtilService.getUUID(), UtilService.getRandomString(4)].join("");
        return await EncryptionService.encode(strData, UtilService.getRandomString(4));
    }
    async createToken({ targetId, category, code, expireInMunites, }) {
        const token = {
            expireInMunites,
            category,
            targetId,
            code: code || (await this.getTokenCode()),
            dangerouslyExpireAt: DateService.addMinutes({ date: new Date(), minutes: expireInMunites }).toISOString(),
        };
        return await this.base_createOne({
            data: token,
        });
    }
    async createConfirmEmailToken({ targetId, expireInMunites, }) {
        return await this.createToken({
            targetId,
            category: AuthTokenCategoryEnum.CONFIRM_EMAIL,
            expireInMunites,
        });
    }
    async createResetPasswordToken({ targetId, expireInMunites, }) {
        return await this.createToken({
            targetId,
            category: AuthTokenCategoryEnum.RESET_PASSWORD,
            expireInMunites,
        });
    }
    async getConfirmEmailToken({ targetId, code }) {
        const [result] = await this.root_target_getWhere({
            targetId,
            query: { code, category: AuthTokenCategoryEnum.CONFIRM_EMAIL },
            limit: 1,
            fields: AuthTokenModel.getLiteFields(),
        });
        return result;
    }
    async getResetPasswordToken({ targetId, code }) {
        const [result] = await this.root_target_getWhere({
            targetId,
            query: { code, category: AuthTokenCategoryEnum.RESET_PASSWORD },
            fields: AuthTokenModel.getLiteFields(),
        });
        return result;
    }
    async getByTargetId({ targetId, category, }) {
        const [result] = await this.root_target_getWhere({
            targetId,
            query: { category },
            fields: AuthTokenModel.getLiteFields(),
        });
        return result;
    }
    async isValidToken(token) {
        const isValid = !!(token?.id && token.dangerouslyExpireAt && new Date(token.dangerouslyExpireAt) > new Date());
        return Promise.resolve(isValid);
    }
}
export const AuthTokenRepository = new AuthTokenRepositoryBase();
//# sourceMappingURL=auth-token-repository.js.map