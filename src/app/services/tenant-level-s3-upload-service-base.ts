import express from "express";
import { GenericFriendlyError } from "@/utils/errors.js";
import { DocumentAssetUploadS3Service } from "@/services/document-asset-upload-s3-service.js";
import { FormDataUploadRequestService } from "@/services/formdata-upload-request-service.js";
import { FileOperationService } from "@/services/file-operation-service.js";
import { S3UploadPathAllocator } from "@/services/s3-upload-path-allocator.js";
import { UniqueIdGeneratorService } from "@/services/unique-id-generator-service.js";
import { ResponseMessage } from "@/helper/response-message.js";

export class TenantLevelS3UploadServiceBase {
  private readonly s3Folder: string;

  constructor({ folder }: { folder: string }) {
    this.s3Folder = folder;
  }

  getAttachmentKeyPath({ tenantId, fileName }: { tenantId: string; fileName: string }) {
    const folderPath = S3UploadPathAllocator.getTenantFolderPath({
      tenantId,
      folderName: this.s3Folder,
    });
    return [folderPath, fileName].join("/");
  }

  async deleteAttachment({ tenantId, fileName }: { tenantId: string; fileName: string }) {
    const keyNamePath01 = this.getAttachmentKeyPath({ tenantId, fileName });
    return await DocumentAssetUploadS3Service.deleteObject(keyNamePath01);
  }

  async uploadAttachment<T>({ req, tenantId }: { req: express.Request; tenantId: string }) {
    const uploadData = await FormDataUploadRequestService.getUploadAndFieldData<T>(req);
    if (!(tenantId && uploadData?.files?.length)) {
      throw GenericFriendlyError.create(ResponseMessage.requiredParameterUndefined);
    }
    for (const item of uploadData.files) {
      const keyNamePath01 = this.getAttachmentKeyPath({
        tenantId,
        fileName: item.fileName,
      });
      await DocumentAssetUploadS3Service.uploadToS3({
        body: item.fileData,
        keyNamePath: keyNamePath01,
        contentType: item.mimeType,
        contentEncoding: item.encoding,
      });
    }
    return uploadData;
  }

  async getS3SignedUrlForObjectFetch({ tenantId, fileName }: { tenantId: string; fileName: string }) {
    const keyNamePath = this.getAttachmentKeyPath({ tenantId, fileName });
    const fullSignedUrl = await DocumentAssetUploadS3Service.getSignedUrlForGetObject({
      keyNamePath,
    });
    return fullSignedUrl;
  }

  async getS3SignedUrlForUpload({
    tenantId,
    mimeType,
    uniqueFileName,
  }: {
    tenantId: string;
    mimeType: string;
    uniqueFileName?: string;
  }) {
    const fileExt = FileOperationService.getFileExtensionFromMimeType(mimeType);
    if (!fileExt) {
      return null;
    }
    const uniqueName = uniqueFileName || UniqueIdGeneratorService.getTimeStampGuid();
    const fileName = [uniqueName, fileExt].join(".");
    const keyNamePath = this.getAttachmentKeyPath({ tenantId, fileName });
    const fullSignedUrl = await DocumentAssetUploadS3Service.getSignedUrlForPutObject({
      keyNamePath,
      contentType: mimeType,
    });
    return {
      fullSignedUrl,
      fileName,
    };
  }
}
