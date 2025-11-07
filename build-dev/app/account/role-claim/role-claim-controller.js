import { DefinedUserPermission } from "@/account/authorization/authorization-permission.js";
import { Router } from "express";
import { RoleClaimRepository } from "./role-claim-repository.js";
import { BaseController } from "@/core/base-controller.js";
import { getPreDefinedRoleClaim } from "./role-claim-defined.js";
async function getAll(req, res) {
    try {
        const { tenantId } = await BaseController.getSessionUserInfo({ req });
        const result = await RoleClaimRepository.getRoleBytenantId({ tenantId });
        return BaseController.resSuccess({
            res,
            data: result,
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function getAllLite(req, res) {
    try {
        const { tenantId } = await BaseController.getSessionUserInfo({ req });
        const result = await RoleClaimRepository.base_getWhere({
            tenantId,
            fields: ["id", "description", "roleName"],
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
async function getById(req, res) {
    try {
        const dataId = req.params.id;
        BaseController.validateParameterStringValue({ dataId });
        const { tenantId } = await BaseController.getSessionUserInfo({ req });
        const result = await RoleClaimRepository.getById({
            dataId,
            tenantId,
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
async function getPreDefined(req, res) {
    try {
        const dataId = req.params.id;
        BaseController.validateParameterStringValue({ dataId });
        await BaseController.getSessionUserInfo({ req });
        return BaseController.resSuccess({
            res,
            data: getPreDefinedRoleClaim(),
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function save(req, res) {
    try {
        const data = req.body;
        const sessionUser = await BaseController.getSessionUserInfo({
            req,
            withAnyPermission: [DefinedUserPermission.admin.superAdmin],
        });
        let result;
        if (BaseController.isNewData(data)) {
            result = await RoleClaimRepository.createRole({ data, sessionUser });
        }
        else {
            result = await RoleClaimRepository.update({ data, sessionUser });
        }
        return BaseController.resSuccess({
            res,
            data: result,
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
const myRouter = Router();
myRouter.post("/", [save]);
myRouter.get("/", [getAll]);
myRouter.get("/lite", [getAllLite]);
myRouter.get("/pre-defined", [getPreDefined]);
myRouter.get("/:id", [getById]);
export const RoleClaimRoute = myRouter;
//# sourceMappingURL=role-claim-controller.js.map