import express from "express";
import { ConfigService } from "@/config/config-service.js";
import { IAuthUserResult, ISessionUser } from "@/account/auth/auth-types.js";
import { CommonConfig } from "@/config/config-common.js";
import { CreateFriendlyError } from "../../helper/response-model.js";
import { ResponseMessage } from "../../helper/response-message.js";
import { JsonWebTokenService } from "../../services/jsonwebtoken-service.js";

const AUTH_TOKEN: string = "Authorization";
const SESSION_USER_VALUE_KEY: string = "current_session_user_2020_08_15";

class RequestSessionResponseServiceBase {
  private getOneHeaderByKey(headerKey: string, req: express.Request) {
    let headerVal: string | null = null;
    const headerArrayOrValue = req.headers[headerKey];
    if (headerArrayOrValue) {
      if (Array.isArray(headerArrayOrValue)) {
        if (typeof headerArrayOrValue[0] === "string") {
          headerVal = headerArrayOrValue[0];
        }
      } else {
        headerVal = headerArrayOrValue;
      }
    }
    return headerVal;
  }

  async getTokenFromHeaders(req: express.Request): Promise<string | null> {
    let authorization: string | null = null;

    if (req.headers.authorization && typeof req.headers.authorization === "string") {
      authorization = req.headers.authorization;
    }

    if (!authorization) {
      authorization = this.getOneHeaderByKey(AUTH_TOKEN, req);
    }

    if (!authorization) {
      authorization = this.getOneHeaderByKey(ConfigService.ClientHeadersKeys.authToken, req);
    }

    if (authorization) {
      const authorizationTrim = authorization.trim();
      if (authorizationTrim.startsWith("Bearer ")) {
        const authorization01 = authorizationTrim.split("Bearer ")[1];
        return authorization01.trim();
      }
    }
    return Promise.resolve(authorization);
  }

  async setCurrentUserSessionVariable({ req, user }: { req: express.Request; user: IAuthUserResult }): Promise<void> {
    //@ts-ignore
    req[SESSION_USER_VALUE_KEY] = JSON.stringify(user);
    await Promise.resolve();
  }

  private async getCurrentSessionUser({ req }: { req: express.Request }): Promise<IAuthUserResult | null> {
    //@ts-ignore
    const userCachedDataStr = req[SESSION_USER_VALUE_KEY];

    if (userCachedDataStr) {
      try {
        const userData: IAuthUserResult = JSON.parse(userCachedDataStr);
        if (userData?.id) {
          return userData;
        }
      } catch (error) {
        //
      }
    }
    const userData: IAuthUserResult = await this.verifyGetUserSessionData(req);
    if (userData?.id) {
      return userData;
    }
    return null;
  }

  async getCurrentUserClaims({ req }: { req: express.Request }) {
    const currentUser = await this.getRequireSessionUserData({ req });
    if (currentUser.userClaims?.length) {
      return currentUser.userClaims;
    }
    return Promise.resolve([]);
  }

  async getRequireSessionUserDataByToken({ token }: { token: string }) {
    const decodedUser = await this.verifyUserToken(token);
    return this.getRequireSessionUserDataBase(decodedUser);
  }

  async getRequireSessionUserData({ req }: { req: express.Request }) {
    const currentUser = await this.getCurrentSessionUser({ req });
    return this.getRequireSessionUserDataBase(currentUser);
  }

  private async getRequireSessionUserDataBase(currentUser: IAuthUserResult | null | undefined) {
    if (!currentUser?.id) {
      throw CreateFriendlyError(ResponseMessage.currentUserDataNotFound);
    }
    if (!currentUser?.tenantId) {
      throw CreateFriendlyError(ResponseMessage.tenantIdUndefined);
    }

    let dataEditLockPeriodInMunite: number = CommonConfig.DATA_LOCK_PERIOD_IN_MUNITES;

    if (currentUser.dataEditLockPeriodInMunite && currentUser.dataEditLockPeriodInMunite > 1) {
      dataEditLockPeriodInMunite = currentUser.dataEditLockPeriodInMunite;
    }

    const params: ISessionUser = {
      isAdmin: currentUser.isAdmin === true,
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      userClaims: currentUser.claims?.length ? currentUser.claims : null,
      dataEditLockPeriodInMunite,
      allowedSchedules: currentUser.allowedSchedules?.length ? currentUser.allowedSchedules : null,
      userName: currentUser.userName,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
    };

    return await Promise.resolve(params);
  }

  private async verifyGetUserSessionData(req: express.Request) {
    const token = await this.getTokenFromHeaders(req);

    const decodedUser = await this.verifyUserToken(token);

    //@ts-ignore
    req[SESSION_USER_VALUE_KEY] = JSON.stringify(decodedUser);
    return decodedUser;
  }

  async verifyUserToken(token: string | null) {
    if (!token) {
      throw CreateFriendlyError("No token provided.");
    }
    const decodedUser = await JsonWebTokenService.verifyToken<IAuthUserResult>(token);
    if (!decodedUser?.id) {
      throw CreateFriendlyError("Token could NOT be verified...");
    }
    return decodedUser;
  }
}

export const AuthSessionHelperService = new RequestSessionResponseServiceBase();
