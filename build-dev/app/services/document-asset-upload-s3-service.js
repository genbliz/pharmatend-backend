import { envConfig } from "../config/env.js";
import { AwsS3BaseService } from "./aws-sdk-s3-base-service.js";
export const DocumentAssetUploadS3Service = new AwsS3BaseService({
    bucketName: envConfig.APP_AWS_S3_UPLOAD_BUCKET_NAME,
    region: envConfig.APP_AWS_REGION,
});
//# sourceMappingURL=document-asset-upload-s3-service.js.map