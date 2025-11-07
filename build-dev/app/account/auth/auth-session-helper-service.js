import { ConfigService } from "@/config/config-service.js";
import { CommonConfig } from "@/config/config-common.js";
import { CreateFriendlyError } from "../../helper/response-model.js";
import { ResponseMessage } from "../../helper/response-message.js";
import { JsonWebTokenService } from "../../services/jsonwebtoken-service.js";
const AUTH_TOKEN = "Authorization";
const SESSION_USER_VALUE_KEY = "current_session_user_2020_08_15";
class RequestSessionResponseServiceBase {
    getOneHeaderByKey(headerKey, req) {
        let headerVal = null;
        const headerArrayOrValue = req.headers[headerKey];
        if (headerArrayOrValue) {
            if (Array.isArray(headerArrayOrValue)) {
                if (typeof headerArrayOrValue[0] === "string") {
                    headerVal = headerArrayOrValue[0];
                }
            }
            else {
                headerVal = headerArrayOrValue;
            }
        }
        return headerVal;
    }
    async getTokenFromHeaders(req) {
        let authorization = null;
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
    async setCurrentUserSessionVariable({ req, user }) {
        req[SESSION_USER_VALUE_KEY] = JSON.stringify(user);
        await Promise.resolve();
    }
    async getCurrentSessionUser({ req }) {
        const userCachedDataStr = req[SESSION_USER_VALUE_KEY];
        if (userCachedDataStr) {
            try {
                const userData = JSON.parse(userCachedDataStr);
                if (userData?.id) {
                    return userData;
                }
            }
            catch (error) {
            }
        }
        const userData = await this.verifyGetUserSessionData(req);
        if (userData?.id) {
            return userData;
        }
        return null;
    }
    async getCurrentUserClaims({ req }) {
        const currentUser = await this.getRequireSessionUserData({ req });
        if (currentUser.userClaims?.length) {
            return currentUser.userClaims;
        }
        return Promise.resolve([]);
    }
    async getRequireSessionUserDataByToken({ token }) {
        const decodedUser = await this.verifyUserToken(token);
        return this.getRequireSessionUserDataBase(decodedUser);
    }
    async getRequireSessionUserData({ req }) {
        const currentUser = await this.getCurrentSessionUser({ req });
        return this.getRequireSessionUserDataBase(currentUser);
    }
    async getRequireSessionUserDataBase(currentUser) {
        if (!currentUser?.id) {
            throw CreateFriendlyError(ResponseMessage.currentUserDataNotFound);
        }
        if (!currentUser?.tenantId) {
            throw CreateFriendlyError(ResponseMessage.tenantIdUndefined);
        }
        let dataEditLockPeriodInMunite = CommonConfig.DATA_LOCK_PERIOD_IN_MUNITES;
        if (currentUser.dataEditLockPeriodInMunite && currentUser.dataEditLockPeriodInMunite > 1) {
            dataEditLockPeriodInMunite = currentUser.dataEditLockPeriodInMunite;
        }
        const params = {
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
    async verifyGetUserSessionData(req) {
        const token = await this.getTokenFromHeaders(req);
        const decodedUser = await this.verifyUserToken(token);
        req[SESSION_USER_VALUE_KEY] = JSON.stringify(decodedUser);
        return decodedUser;
    }
    async verifyUserToken(token) {
        if (!token) {
            throw CreateFriendlyError("No token provided.");
        }
        const decodedUser = await JsonWebTokenService.verifyToken(token);
        if (!decodedUser?.id) {
            throw CreateFriendlyError("Token could NOT be verified...");
        }
        return decodedUser;
    }
}
export const AuthSessionHelperService = new RequestSessionResponseServiceBase();
//# sourceMappingURL=auth-session-helper-service.js.map