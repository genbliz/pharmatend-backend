import { AuthService } from "@/account/auth/auth-service.js";
import express, { Router } from "express";
import { UserRepository } from "@/account/user/user-repository.js";
import { IAuthLoginDto } from "@/account/auth/auth-types.js";
import { IRegisterUser } from "@/account/user/user-types.js";
import { DefinedUserPermission } from "@/account/authorization/authorization-permission.js";
import { BaseController } from "@/core/base-controller.js";

async function userLogin(req: express.Request, res: express.Response) {
  try {
    const data = req.body as IAuthLoginDto;

    const loginData = await AuthService.loginUser(data);

    return BaseController.resSuccess({
      res,
      data: loginData,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function userRegister(req: express.Request, res: express.Response) {
  try {
    const user: IRegisterUser = req.body;

    const sessionUser = await BaseController.getSessionUserInfo({
      req,
      withAnyPermission: [
        //
        DefinedUserPermission.admin.createUser,
      ],
    });

    const result = await UserRepository.createRegisterUser({
      userData: user,
      sessionUser,
      password: user.password,
    });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

const router = Router();

router.post(`/register`, [userRegister]);
router.post("/login", [userLogin]);

export const AuthRouter = router;
