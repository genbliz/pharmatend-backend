import { BaseController } from "@/core/base-controller.js";
import { Request, Response, Router } from "express";
import { TenantAssetS3UploadService } from "../tenant-asset-upload-service.js";
import { ITenantSetting } from "./tenant-setting-types.js";
import { TenantSettingRepository } from "./tenant-setting-repository.js";

async function getById(req: Request, res: Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({ req });

    const dataId: string = req.params.id;

    BaseController.validateParameterStringValue({ dataId });

    const result = await TenantSettingRepository.findSingle({ dataId, tenantId });

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function save(req: Request, res: Response) {
  try {
    const data: ITenantSetting = req.body;
    let result: ITenantSetting;
    const sessionUser = await BaseController.getSessionUserInfo({
      req,
      withAnyPermission: [
        //
        BaseController.DefinedRequiredPermission.admin.changeSystemSetting,
      ],
    });

    if (BaseController.isNewData(data)) {
      result = await TenantSettingRepository.save({ data, sessionUser });
    } else {
      result = await TenantSettingRepository.update({ data, sessionUser });
    }

    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

async function getSingleByTenant(req: Request, res: Response) {
  try {
    const { tenantId } = await BaseController.getSessionUserInfo({ req });

    const result = await TenantSettingRepository.findSingleByTenantId({ tenantId });
    return BaseController.resSuccess({
      res,
      data: result,
    });
  } catch (error) {
    return BaseController.resError({ res, error });
  }
}

function getSignedUrlForUpload(type: "logo" | "name") {
  return async (req: Request, res: Response) => {
    try {
      type ISignedUrlRequest = { mimeType: string; fileSize: number };

      const { tenantId } = await BaseController.getSessionUserInfo({
        req,
        withAnyPermission: [
          //
          BaseController.DefinedRequiredPermission.admin.changeSystemSetting,
        ],
      });

      const { mimeType, fileSize } = req.body as ISignedUrlRequest;

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
    } catch (error) {
      return BaseController.resError({ res, error });
    }
  };
}

const myRouter = Router();
//
myRouter.post("/", [save]);
myRouter.post("/logo/upload/signed-url", [getSignedUrlForUpload("logo")]);
myRouter.post("/name/upload/signed-url", [getSignedUrlForUpload("name")]);
//
myRouter.get("/", [getSingleByTenant]);
myRouter.get("/:id", [getById]);
//
export const TenantSettingRoute = myRouter;
