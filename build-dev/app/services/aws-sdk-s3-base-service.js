import { S3Client, GetObjectCommand, ListObjectsCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import stream from "node:stream";
import { GenericFriendlyError } from "../utils/errors.js";
export class AwsS3BaseService {
    client;
    SIGNED_URL_EXPIRE_IN;
    SIGNED_URL_EXPIRE_IN_DEFAULT = 60 * 60;
    region;
    bucketName;
    constructor({ region, bucketName, SIGNED_URL_EXPIRE_IN, }) {
        this.region = region;
        this.bucketName = bucketName;
        this.SIGNED_URL_EXPIRE_IN = SIGNED_URL_EXPIRE_IN || this.SIGNED_URL_EXPIRE_IN_DEFAULT;
    }
    getS3Instance() {
        if (!this.client) {
            this.client = new S3Client({
                region: this.region,
            });
        }
        return this.client;
    }
    getUploadBucketName() {
        if (!this.bucketName) {
            throw GenericFriendlyError.createValidationError("Bucket Name not found in env variable");
        }
        return this.bucketName;
    }
    getBucketBaseUrl() {
        const bucketName = this.getUploadBucketName();
        const region = this.region;
        const urlBase = `https://s3.${region}.amazonaws.com/${bucketName}`;
        return urlBase;
    }
    getFullObjectUrl(keyPath) {
        const bucketBase = this.getBucketBaseUrl();
        const urlFull = `${bucketBase}/${keyPath}`;
        return urlFull;
    }
    async getObject(fileKeyPath) {
        try {
            const bucketName = this.getUploadBucketName();
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: fileKeyPath,
            });
            const data = await this.getS3Instance().send(command);
            return data?.Body ?? null;
        }
        catch (error) {
            if (error?.name === "NoSuchKey") {
                return null;
            }
            if (error?.message === "NoSuchKey") {
                return null;
            }
            if (error?.name === "NotFound") {
                return null;
            }
            if (error?.message === "NotFound") {
                return null;
            }
            if (error?.$metadata?.httpStatusCode === 404) {
                return null;
            }
            throw error;
        }
    }
    async getJsonObject({ fileKeyPath, }) {
        const filePath01 = fileKeyPath.endsWith(".json") ? fileKeyPath : `${fileKeyPath}.json`;
        const objectData = await this.getObject({ fileKeyPath: filePath01 });
        if (objectData && objectData instanceof stream.Readable) {
            const dataStream = await consumers.json(objectData);
            return dataStream;
        }
        return null;
    }
    async listObjects(prefix) {
        const bucketName = this.getUploadBucketName();
        const bucketParams = {
            Bucket: bucketName,
            Prefix: prefix ?? undefined,
        };
        const command = new ListObjectsCommand(bucketParams);
        const { Contents } = await this.getS3Instance().send(command);
        if (!Contents?.length) {
            return null;
        }
        return Contents.map((f) => {
            return {
                name: f.Key ?? "",
                size: f.Size ?? 0,
            };
        });
    }
    async deleteObject(objectKeyPath) {
        const bucketName = this.getUploadBucketName();
        const bucketParams = {
            Bucket: bucketName,
            Key: objectKeyPath,
        };
        const command = new DeleteObjectCommand(bucketParams);
        await this.getS3Instance().send(command);
        return true;
    }
    async uploadToS3({ body, keyNamePath, contentType, contentEncoding, }) {
        const bucketName = this.getUploadBucketName();
        const bucketParams = {
            Body: body,
            Bucket: bucketName,
            Key: keyNamePath,
            ContentType: contentType,
            ContentEncoding: contentEncoding,
        };
        const command = new PutObjectCommand(bucketParams);
        return await this.getS3Instance().send(command);
    }
    async getSignedUrlForPutObject({ keyNamePath, contentType }) {
        const bucketName = this.getUploadBucketName();
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: keyNamePath,
            ContentType: contentType,
        });
        return await getSignedUrl(this.getS3Instance(), command, {
            expiresIn: this.SIGNED_URL_EXPIRE_IN,
        });
    }
    async getSignedUrlForGetObject({ keyNamePath }) {
        const bucketName = this.getUploadBucketName();
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: keyNamePath,
        });
        return await getSignedUrl(this.getS3Instance(), command, {
            expiresIn: this.SIGNED_URL_EXPIRE_IN,
        });
    }
    async checkFileExists(fileKeyPath) {
        const bucketName = this.getUploadBucketName();
        try {
            const params = {
                Bucket: bucketName,
                Key: fileKeyPath,
            };
            const command = new HeadObjectCommand(params);
            await this.getS3Instance().send(command);
            return true;
        }
        catch (error) {
            if (error?.name === "NotFound") {
                return false;
            }
            if (error?.$metadata?.httpStatusCode === 404) {
                return false;
            }
            if (error?.name === "NoSuchKey") {
                return false;
            }
            if (error?.message === "NoSuchKey") {
                return false;
            }
            return false;
        }
    }
}
//# sourceMappingURL=aws-sdk-s3-base-service.js.map