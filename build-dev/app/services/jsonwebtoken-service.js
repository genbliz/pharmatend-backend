import { GenericFriendlyError } from "./../utils/errors.js";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.js";
import { UtilService } from "./util-service.js";
class JsonWebTokenServiceBase {
    jwtVerifyTokenBase(token) {
        return new Promise((resolve) => {
            const authSecret01 = envConfig.APP_SERVER_JWT_SECRET;
            jwt.verify(token, authSecret01, (err, decoded) => {
                if (err) {
                    let errMsg = "Failed to authenticate token";
                    if (err.name === "TokenExpiredError") {
                        errMsg = "Your login has expired...";
                    }
                    else if (err.name === "JsonWebTokenError") {
                        errMsg = "Failed to authenticate. Invalid Token";
                    }
                    resolve({ decoded: null, error: errMsg });
                }
                else {
                    resolve({ decoded, error: null });
                }
            });
        });
    }
    async verifyToken(token) {
        const { decoded, error } = await this.jwtVerifyTokenBase(token);
        if (error) {
            throw GenericFriendlyError.createUnAuthorizedError(error);
        }
        return decoded;
    }
    signToken({ authData, audience, expiresInSeconds, }) {
        const userData01 = UtilService.convertObjectToJsonPlainObject(authData);
        const authSecret01 = envConfig.APP_SERVER_JWT_SECRET;
        const result = jwt.sign(userData01, authSecret01, {
            expiresIn: Number(expiresInSeconds),
            audience,
        });
        return Promise.resolve(result);
    }
    signTokenWithSecret({ authData, audience, expiresInSeconds, authSecret, }) {
        const userData01 = UtilService.convertObjectToJsonPlainObject(authData);
        const result = jwt.sign(userData01, authSecret, {
            expiresIn: Number(expiresInSeconds),
            audience,
        });
        return Promise.resolve(result);
    }
}
export const JsonWebTokenService = new JsonWebTokenServiceBase();
//# sourceMappingURL=jsonwebtoken-service.js.map