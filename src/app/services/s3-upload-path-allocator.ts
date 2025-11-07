import { envConfig } from "./../config/env.js";

class S3UploadPathAllocatorBase {
  getTenantFolderPath({ tenantId, folderName }: { tenantId: string; folderName: string }) {
    const prefix = envConfig.NODE_ENV === "production" ? `tend-pos-production` : `tend-pos-staging`;
    return [prefix, `tenant-${tenantId}`, folderName].join("/");
  }
}

export const S3UploadPathAllocator = new S3UploadPathAllocatorBase();
