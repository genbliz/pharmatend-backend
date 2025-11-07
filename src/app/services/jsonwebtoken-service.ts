import { GenericFriendlyError } from "@/utils/errors.js";
import jwt from "jsonwebtoken";
import { envConfig } from "@/config/env.js";
import { UtilService } from "@/services/util-service.js";

class JsonWebTokenServiceBase {
  //
  private jwtVerifyTokenBase(token: string) {
    return new Promise<{ error: string | null; decoded: any }>((resolve) => {
      const authSecret01 = envConfig.APP_SERVER_JWT_SECRET;
      jwt.verify(token, authSecret01, (err, decoded) => {
        if (err) {
          let errMsg = "Failed to authenticate token";
          if (err.name === "TokenExpiredError") {
            errMsg = "Your login has expired...";
          } else if (err.name === "JsonWebTokenError") {
            errMsg = "Failed to authenticate. Invalid Token";
          }
          resolve({ decoded: null, error: errMsg });
        } else {
          resolve({ decoded, error: null });
        }
      });
    });
  }

  async verifyToken<T>(token: string) {
    const { decoded, error } = await this.jwtVerifyTokenBase(token);
    if (error) {
      throw GenericFriendlyError.createUnAuthorizedError(error);
    }
    return decoded as T;
  }

  signToken({
    authData,
    audience,
    expiresInSeconds,
  }: {
    authData: Record<string, any>;
    audience: string;
    expiresInSeconds: number;
  }) {
    const userData01 = UtilService.convertObjectToJsonPlainObject(authData);
    const authSecret01 = envConfig.APP_SERVER_JWT_SECRET;
    const result = jwt.sign(userData01, authSecret01, {
      expiresIn: Number(expiresInSeconds),
      audience,
    });
    return Promise.resolve(result);
  }

  signTokenWithSecret({
    authData,
    audience,
    expiresInSeconds,
    authSecret,
  }: {
    authData: Record<string, any>;
    audience: string;
    expiresInSeconds: number;
    authSecret: string;
  }) {
    const userData01 = UtilService.convertObjectToJsonPlainObject(authData);
    const result = jwt.sign(userData01, authSecret, {
      expiresIn: Number(expiresInSeconds),
      audience,
    });
    return Promise.resolve(result);
  }
}

export const JsonWebTokenService = new JsonWebTokenServiceBase();
