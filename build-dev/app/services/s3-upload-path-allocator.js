import { envConfig } from "./../config/env.js";
class S3UploadPathAllocatorBase {
    getTenantFolderPath({ tenantId, folderName }) {
        const prefix = envConfig.NODE_ENV === "production" ? `tend-pos-production` : `tend-pos-staging`;
        return [prefix, `tenant-${tenantId}`, folderName].join("/");
    }
}
export const S3UploadPathAllocator = new S3UploadPathAllocatorBase();
//# sourceMappingURL=s3-upload-path-allocator.js.map