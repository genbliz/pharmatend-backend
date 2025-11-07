import { AuthService } from "./auth-service.js";
import { Router } from "express";
import { UserRepository } from "../user/user-repository.js";
import { DefinedUserPermission } from "../authorization/authorization-permission.js";
import { BaseController } from "@/core/base-controller.js";
async function userLogin(req, res) {
    try {
        const data = req.body;
        const loginData = await AuthService.loginUser(data);
        return BaseController.resSuccess({
            res,
            data: loginData,
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function userRegister(req, res) {
    try {
        const user = req.body;
        const sessionUser = await BaseController.getSessionUserInfo({
            req,
            withAnyPermission: [
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
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
const router = Router();
router.post(`/register`, [userRegister]);
router.post("/login", [userLogin]);
export const AuthRouter = router;
//# sourceMappingURL=auth-controller.js.map