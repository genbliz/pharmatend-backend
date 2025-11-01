import { EncryptionService } from "@/services/encryption-service";
import { UtilService } from "@/services/util-service";
import { DateService } from "@/services/date-service";
import { IAuthToken, AuthTokenCategoryEnum } from "./auth-token-types";
import { AuthTokenModel } from "./auth-token-model";
import { CoreTempRepository } from "@/core/core-temp-repository";

class AuthTokenRepositoryBase extends CoreTempRepository<IAuthToken> {
  constructor() {
    super({
      schemaSubDef: AuthTokenModel.getSchemaDef(),
      featureEntity: AuthTokenModel.getTableName(),
      fieldAliases: AuthTokenModel.getFieldAliases(),
      strictRequiredFields: ["dangerouslyExpireAt", "targetId"],
    });
  }

  private async getTokenCode() {
    const strData = [UtilService.getUUID(), UtilService.getRandomString(4)].join("");
    return await EncryptionService.encode(strData, UtilService.getRandomString(4));
  }

  private async createToken({
    targetId,
    category,
    code,
    expireInMunites,
  }: {
    targetId: string;
    code?: string;
    category: AuthTokenCategoryEnum;
    expireInMunites: number;
  }): Promise<IAuthToken> {
    const token = {
      expireInMunites,
      category,
      targetId,
      code: code || (await this.getTokenCode()),
      dangerouslyExpireAt: DateService.addMinutes({ date: new Date(), minutes: expireInMunites }).toISOString(),
    } as IAuthToken;
    return await this.base_createOne({
      data: token,
    });
  }

  async createConfirmEmailToken({
    targetId,
    expireInMunites,
  }: {
    targetId: string;
    expireInMunites: number;
  }): Promise<IAuthToken> {
    return await this.createToken({
      targetId,
      category: AuthTokenCategoryEnum.CONFIRM_EMAIL,
      expireInMunites,
    });
  }

  async createResetPasswordToken({
    targetId,
    expireInMunites,
  }: {
    targetId: string;
    expireInMunites: number;
  }): Promise<IAuthToken> {
    return await this.createToken({
      targetId,
      category: AuthTokenCategoryEnum.RESET_PASSWORD,
      expireInMunites,
    });
  }

  async getConfirmEmailToken({ targetId, code }: { targetId: string; code: string }): Promise<IAuthToken | null> {
    const [result] = await this.root_target_getWhere({
      targetId,
      query: { code, category: AuthTokenCategoryEnum.CONFIRM_EMAIL },
      limit: 1,
      fields: AuthTokenModel.getLiteFields(),
    });
    return result;
  }

  async getResetPasswordToken({ targetId, code }: { targetId: string; code: string }): Promise<IAuthToken | null> {
    const [result] = await this.root_target_getWhere({
      targetId,
      query: { code, category: AuthTokenCategoryEnum.RESET_PASSWORD },
      fields: AuthTokenModel.getLiteFields(),
    });
    return result;
  }

  async getByTargetId({
    targetId,
    category,
  }: {
    targetId: string;
    category: AuthTokenCategoryEnum;
  }): Promise<IAuthToken | null> {
    const [result] = await this.root_target_getWhere({
      targetId,
      query: { category },
      fields: AuthTokenModel.getLiteFields(),
    });
    return result;
  }

  async isValidToken(token: IAuthToken): Promise<boolean> {
    const isValid = !!(token?.id && token.dangerouslyExpireAt && new Date(token.dangerouslyExpireAt) > new Date());
    return Promise.resolve(isValid);
  }
}

export const AuthTokenRepository = new AuthTokenRepositoryBase();
