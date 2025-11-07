import express from "express";
import { AuthSessionHelperService } from "@/account/auth/auth-session-helper-service.js";
import { IAuthUserResult } from "@/account/auth/auth-types.js";
import { GenericFriendlyError } from "@/utils/errors.js";
import { ResponseModelResolve } from "@/helper/response-model.js";
import { StatusCode } from "@/helper/status-code.js";
import { JsonWebTokenService } from "@/services/jsonwebtoken-service.js";

async function verifyUserToken(token: string) {
  return await JsonWebTokenService.verifyToken<IAuthUserResult>(token);
}

async function verifyUser(req: express.Request) {
  const token01 = await AuthSessionHelperService.getTokenFromHeaders(req);
  if (!token01) {
    throw GenericFriendlyError.createUnAuthorizedError("No token provided.");
  }

  const decodedUser: IAuthUserResult = await verifyUserToken(token01);

  if (decodedUser?.id) {
    return decodedUser;
  }
  throw GenericFriendlyError.createValidationError("Token could NOT be verified...");
}

async function varifyUserTokenRoute(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const userData = await verifyUser(req);
    if (userData?.id) {
      await AuthSessionHelperService.setCurrentUserSessionVariable({ req, user: userData });
      next();
    } else {
      const resp = ResponseModelResolve.error({ message: "Token could NOT be verified..." });
      res.status(StatusCode.Unauthorized_401).json(resp);
    }
  } catch (err) {
    const { response } = ResponseModelResolve.errorResolve({ error: err, message: "Error verifying token" });
    res.status(StatusCode.Unauthorized_401).json(response);
  }
}

export const AuthUserVerifyService = {
  varifyUserTokenRoute,
  verifyUserToken,
};
//
const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.use(AuthUserVerifyService.varifyUserTokenRoute);
export const userVerifyRouter = router;
