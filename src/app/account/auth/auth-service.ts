import { LoggingService } from "@/services/logging-service.js";
import { envConfig } from "@/config/env.js";
import { UtilService } from "@/services/util-service.js";
import { AdminService } from "../admin/admin-service.js";
import { UserLoginRepository } from "@/account/user-login/user-login-repository.js";
import { RoleClaimRepository } from "@/account/role-claim/role-claim-repository.js";
import { UserRepository } from "@/account/user/user-repository.js";
import { IAuthLoginDto, IAuthUserResult, IAuthLoginResult, IAuthLoginBaseDto, IAuthUserInfo } from "./auth-types.js";
import { JsonWebTokenService } from "@/services/jsonwebtoken-service.js";
import { TenantSettingRepository } from "@/common/tenant/tenant-setting/tenant-setting-repository.js";
import { IUser } from "@/account/user/user-types.js";
import { ITenant } from "../admin/admin-types.js";
import { getAllAuthorizationPermissionParameters } from "../authorization/authorization-permission.js";
import { DateService } from "@/services/date-service.js";
import { SystemService } from "@/services/system-service.js";
import { BaseHelperUtils } from "@/core/base-error-helper-utils.js";
import { ResponseMessage } from "../../helper/response-message.js";

class AuthServiceBase extends BaseHelperUtils {
  async loginUserByParams({
    password,
    shortCode,
    email,
  }: {
    password: string;
    shortCode: number;
    email: string;
  }): Promise<IAuthLoginResult> {
    const loginData: IAuthLoginDto = {
      password,
      shortCode,
      userName: email,
      isAdmin: false,
    };
    return await this.loginUser(loginData);
  }

  async reLoginUserBySessionParams({
    userId,
    tenantId,
    password,
  }: {
    userId: string;
    tenantId: string;
    password: string;
  }): Promise<IAuthLoginResult> {
    // find user
    const user = await UserRepository.getUserById({
      userId,
      tenantId,
      isLiteFields: false,
    });

    if (!user?.id) {
      throw this.helper_CreateFriendlyError(ResponseMessage.authenticationFailedUserNotFound);
    }

    // find tenant
    const tenantData = await AdminService.getCachedTenant_ByTenantId({ tenantId });
    if (!tenantData?.id) {
      throw this.helper_CreateFriendlyError(ResponseMessage.tenantCacheDataNotFound);
    }

    return await this.loginOrdinaryUserBase({ user, tenantData, password });
  }

  async loginUser(loginData: IAuthLoginDto): Promise<IAuthLoginResult> {
    if (!loginData?.userName) {
      throw this.helper_CreateFriendlyError("Invalid user name or email");
    }
    this.validateRequiredString({ password: loginData.password });
    this.validateRequiredNumber({ shortCode: loginData.shortCode });

    const loginName = loginData.userName;
    const isEmailLogin = UtilService.isValidEmail(loginName);

    if (loginData.isAdmin) {
      if (!isEmailLogin) {
        throw this.helper_CreateFriendlyError("Administrator MUST login with valid email");
      }
      return await this.loginUserAsAdmin({ ...loginData });
    }

    // find tenant
    const tenantData = await AdminService.getCachedTenant_ByShortCode(loginData.shortCode);
    if (!tenantData?.id) {
      throw this.helper_CreateFriendlyError(ResponseMessage.tenantCacheDataNotFound);
    }

    // find user
    let user: IUser | null = null;

    if (isEmailLogin) {
      user = await UserRepository.getUserByEmail({
        email: loginName,
        tenantId: tenantData.id,
        isLiteFields: false,
      });
    } else {
      user = await UserRepository.getUserByUserName({
        userName: loginName,
        tenantId: tenantData.id,
        isLiteFields: false,
      });
    }

    if (!user?.id) {
      throw this.helper_CreateFriendlyError(ResponseMessage.authenticationFailedUserNotFound);
    }

    return await this.loginOrdinaryUserBase({
      user,
      tenantData,
      password: loginData.password,
    });
  }

  private async loginUserAsAdmin(loginData: IAuthLoginDto): Promise<IAuthLoginResult> {
    try {
      // find user
      const adminUserData01 = await AdminService.adminUserRemoteLogin({
        email: loginData.userName,
        password: loginData.password,
        shortCode: loginData.shortCode,
      });

      if (!adminUserData01?.user?.id) {
        throw this.helper_CreateFriendlyError(ResponseMessage.authenticationFailedUserNotFound);
      }
      const adminUser = { ...adminUserData01.user };

      if (!adminUserData01?.tenant?.id) {
        throw this.helper_CreateFriendlyError(ResponseMessage.tenantCacheDataNotFound);
      }
      const tenantData = { ...adminUserData01.tenant };

      const user01: IAuthUserInfo = {
        id: adminUser.id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        userName: adminUser.email,
        email: adminUser.email,
        phone: adminUser.phone,
        address: adminUser.address,
        tenantId: tenantData.id,
        // createdAtDate: adminUser.createdAtDate,
        isAdmin: tenantData.creatorUserAdminId === adminUser.id,
      };

      let claims01: string[] = [];

      if (user01.isAdmin) {
        const { adminClaims } = getAllAuthorizationPermissionParameters();
        claims01 = adminClaims;
      }

      const resultData = await this.getAuthResult({
        user: user01,
        tenantData,
        claims: Array.from(new Set(claims01)),
      });

      try {
        await UserLoginRepository.createSucceed({
          tenantId: resultData.tenant.id,
          userId: resultData.user.id,
        });
      } catch (error) {
        LoggingService.anyError(error);
      }

      return resultData;
    } catch (error) {
      if (SystemService.isLocalDeploy()) {
        const isOnline = await UtilService.isDeviceOnline();
        if (!isOnline) {
          throw this.helper_CreateFriendlyError(
            "You are currently offline. Please, connect to the internet to login as admin",
          );
        }
      }
      throw error;
    }
  }

  private async loginOrdinaryUserBase(loginData: IAuthLoginBaseDto): Promise<IAuthLoginResult> {
    const { user, tenantData, password } = loginData;
    //
    if (!user?.id) {
      throw this.helper_CreateFriendlyError(ResponseMessage.authenticationFailedUserNotFound);
    }

    if (user?.isLockOutEnabled) {
      await UserLoginRepository.createLockout({
        tenantId: tenantData.id,
        userId: user.id,
      });
      throw this.helper_CreateFriendlyError("User had been locked out");
    }

    // check password
    try {
      await UserRepository.checkPasswordByUserData({ user, password });
    } catch (error) {
      const errMsg = this.helper_GetFriendlyErrorMessage(error);
      await UserLoginRepository.createFailed({
        tenantId: tenantData.id,
        userId: user.id,
        remark: errMsg ?? "",
      });
      throw error;
    }

    // find tenant
    if (!tenantData?.id) {
      await UserLoginRepository.createFailed({
        tenantId: tenantData.id,
        userId: user.id,
        remark: ResponseMessage.tenantCacheDataNotFound,
      });
      throw this.helper_CreateFriendlyError(ResponseMessage.tenantCacheDataNotFound);
    }

    // check association with tenant
    if (tenantData.id !== user.tenantId) {
      const errorMsg = `User NOT associated with the organization (${tenantData.shortCode}).`;
      await UserLoginRepository.createFailed({
        tenantId: tenantData.id,
        userId: user.id,
        remark: errorMsg,
      });
      throw this.helper_CreateFriendlyError(errorMsg);
    }

    // fetch roles and claims
    const claims01: string[] = [];

    if (user?.roleClaimIds?.length) {
      const roleClaims = await RoleClaimRepository.getRoleClaimWithIds({
        roleClaimIds: user.roleClaimIds,
        tenantId: tenantData.id,
      });

      if (roleClaims?.length) {
        roleClaims.forEach((roleClaim) => {
          roleClaim?.claims?.forEach((claim) => {
            claims01.push(claim);
          });
        });
      }
    }

    const userData: IAuthUserInfo = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      email: user.email,
      userName: user.userName,
      phone: user.phone,
      tenantId: tenantData.id,
      isAdmin: false,
    };

    const resultData = await this.getAuthResult({
      user: userData,
      tenantData,
      claims: Array.from(new Set(claims01)),
    });

    try {
      await UserLoginRepository.createSucceed({
        tenantId: resultData.tenant.id,
        userId: resultData.user.id,
      });
    } catch (error) {
      LoggingService.error(error);
    }

    return resultData;
  }

  private async getAuthResult({
    user,
    tenantData,
    claims,
  }: {
    user: IAuthUserInfo;
    tenantData: ITenant;
    claims: string[];
  }) {
    const tenantSetting = await TenantSettingRepository.findSingleByTenantId({ tenantId: tenantData.id });
    let dataEditLockPeriodInMunite: number | null = null;
    if (!user?.isAdmin) {
      dataEditLockPeriodInMunite = tenantSetting?.dataEditLockPeriodInMunite ?? null;
    }

    const allowSchedules: string[] = [];

    const userData: IAuthUserResult = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      email: user.email,
      userName: user.userName,
      phone: user.phone,
      tenantId: tenantData.id,
      isAdmin: user.isAdmin,
      claims: claims.sort(),
      dataEditLockPeriodInMunite,
      allowedSchedules: allowSchedules?.length ? allowSchedules : undefined,
    };

    const expirationInSeconds = envConfig.APP_SERVER_LOGIN_EXPIRATION_IN_SECONDS;
    const loginDateTime = new Date();
    const twoHoursInSeconds = 60 * 60 * 2;

    let expirationInSeconds01 = twoHoursInSeconds;
    if (typeof expirationInSeconds === "number" && expirationInSeconds > 10) {
      expirationInSeconds01 = expirationInSeconds;
    }
    expirationInSeconds01 = Number(expirationInSeconds01);

    const userToken01 = await JsonWebTokenService.signToken({
      authData: userData,
      expiresInSeconds: expirationInSeconds01,
      audience: userData.id,
    });

    const { exp } = await JsonWebTokenService.verifyToken<IAuthUserResult>(userToken01);

    const expireEstimate = exp
      ? DateService.fromEpochTime(exp)
      : DateService.addSeconds({ date: loginDateTime, seconds: expirationInSeconds01 });

    const resultData: IAuthLoginResult = {
      user: userData,
      token: userToken01,
      tenant: tenantData,
      setting: tenantSetting,
      expireAt: expireEstimate.toISOString(),
      systemPreference: await SystemService.getAllConfig(),
    };
    return resultData;
  }
}

export const AuthService = new AuthServiceBase();
