import { BaseController } from "@/core/base-controller.js";
import { Router } from "express";
import { TenantAssetS3UploadService } from "../tenant-asset-upload-service.js";
import { TenantSettingRepository } from "./tenant-setting-repository.js";
async function getById(req, res) {
    try {
        const { tenantId } = await BaseController.getSessionUserInfo({ req });
        const dataId = req.params.id;
        BaseController.validateParameterStringValue({ dataId });
        const result = await TenantSettingRepository.findSingle({ dataId, tenantId });
        return BaseController.resSuccess({
            res,
            data: result,
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
async function save(req, res) {
    try {
        const data = req.body;
        let result;
        const sessionUser = await BaseController.getSessionUserInfo({
            req,
            withAnyPermission: [
                BaseController.DefinedRequiredPermission.admin.changeSystemSetting,
            ],
        });
        if (BaseController.isNewData(data)) {
            result = await TenantSettingRepository.save({ data, sessionUser });
        }
        else {
            result = await TenantSettingRepository.update({ data, sessionUser });
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
async function getSingleByTenant(req, res) {
    try {
        const { tenantId } = await BaseController.getSessionUserInfo({ req });
        const result = await TenantSettingRepository.findSingleByTenantId({ tenantId });
        return BaseController.resSuccess({
            res,
            data: result,
        });
    }
    catch (error) {
        return BaseController.resError({ res, error });
    }
}
function getSignedUrlForUpload(type) {
    return async (req, res) => {
        try {
            const { tenantId } = await BaseController.getSessionUserInfo({
                req,
                withAnyPermission: [
                    BaseController.DefinedRequiredPermission.admin.changeSystemSetting,
                ],
            });
            const { mimeType, fileSize } = req.body;
            BaseController.validateRequiredNumber({ fileSize });
            if (!mimeType) {
                return BaseController.resError({
                    res,
                    message: "Invalid file signedUrlRequest",
                });
            }
            const result = await TenantAssetS3UploadService.getS3SignedUrlForUpload({
                tenantId,
                mimeType,
                uniqueFileName: `${type}-${tenantId}`,
            });
            return BaseController.resSuccess({
                res,
                data: result,
            });
        }
        catch (error) {
            return BaseController.resError({ res, error });
        }
    };
}
const myRouter = Router();
myRouter.post("/", [save]);
myRouter.post("/logo/upload/signed-url", [getSignedUrlForUpload("logo")]);
myRouter.post("/name/upload/signed-url", [getSignedUrlForUpload("name")]);
myRouter.get("/", [getSingleByTenant]);
myRouter.get("/:id", [getById]);
export const TenantSettingRoute = myRouter;
//# sourceMappingURL=tenant-setting-controller.js.map