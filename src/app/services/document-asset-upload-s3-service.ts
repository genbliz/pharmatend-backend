import { envConfig } from "../config/env";
import { AwsS3BaseService } from "./aws-sdk-s3-base-service";

export const DocumentAssetUploadS3Service = new AwsS3BaseService({
  bucketName: envConfig.APP_AWS_S3_UPLOAD_BUCKET_NAME,
  region: envConfig.APP_AWS_REGION,
});
