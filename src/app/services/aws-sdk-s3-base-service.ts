import {
  S3Client,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommandInput,
  PutObjectCommand,
  ListObjectsCommandInput,
  DeleteObjectCommandInput,
  DeleteObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import stream from "node:stream";
import consumers from "node:stream/consumers";
import { GenericFriendlyError } from "@/utils/errors.js";

export class AwsS3BaseService {
  private client: S3Client | undefined;
  private readonly SIGNED_URL_EXPIRE_IN: number;
  private readonly SIGNED_URL_EXPIRE_IN_DEFAULT = 60 * 60;
  private readonly region: string;
  private readonly bucketName: string;

  constructor({
    region,
    bucketName,
    SIGNED_URL_EXPIRE_IN,
  }: {
    region: string;
    bucketName: string;
    SIGNED_URL_EXPIRE_IN?: number;
  }) {
    this.region = region;
    this.bucketName = bucketName;
    this.SIGNED_URL_EXPIRE_IN = SIGNED_URL_EXPIRE_IN || this.SIGNED_URL_EXPIRE_IN_DEFAULT;
  }

  private getS3Instance() {
    if (!this.client) {
      this.client = new S3Client({
        region: this.region,
      });
    }
    return this.client;
  }

  private getUploadBucketName() {
    if (!this.bucketName) {
      throw GenericFriendlyError.createValidationError("Bucket Name not found in env variable");
    }
    return this.bucketName;
  }

  getBucketBaseUrl() {
    const bucketName: string = this.getUploadBucketName();
    const region: string = this.region;
    const urlBase = `https://s3.${region}.amazonaws.com/${bucketName}`;
    return urlBase;
  }

  getFullObjectUrl(keyPath: string) {
    const bucketBase: string = this.getBucketBaseUrl();
    const urlFull = `${bucketBase}/${keyPath}`;
    return urlFull;
  }

  private async getObject({ fileKeyPath }: { fileKeyPath: string }) {
    try {
      const bucketName: string = this.getUploadBucketName();
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKeyPath,
      });
      const data = await this.getS3Instance().send(command);

      return data?.Body ?? null;
    } catch (error: any) {
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
      // NoSuchBucket
      if (error?.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async getJsonObject<T = Record<string, unknown> | Record<string, unknown>[]>({
    fileKeyPath,
  }: {
    fileKeyPath: string;
  }) {
    const filePath01 = fileKeyPath.endsWith(".json") ? fileKeyPath : `${fileKeyPath}.json`;
    const objectData = await this.getObject({ fileKeyPath: filePath01 });
    if (objectData && objectData instanceof stream.Readable) {
      const dataStream = await consumers.json(objectData);
      return dataStream as T;
    }
    return null;
  }

  async listObjects(prefix?: string) {
    const bucketName = this.getUploadBucketName();
    const bucketParams: ListObjectsCommandInput = {
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

  async deleteObject(objectKeyPath: string) {
    const bucketName = this.getUploadBucketName();

    const bucketParams: DeleteObjectCommandInput = {
      Bucket: bucketName,
      Key: objectKeyPath,
    };
    const command = new DeleteObjectCommand(bucketParams);
    await this.getS3Instance().send(command);
    return true;
  }

  async uploadToS3({
    body,
    keyNamePath,
    contentType,
    contentEncoding,
  }: {
    body: Buffer;
    keyNamePath: string;
    contentType: string;
    contentEncoding: string;
  }) {
    const bucketName: string = this.getUploadBucketName();

    const bucketParams: PutObjectCommandInput = {
      Body: body,
      Bucket: bucketName,
      Key: keyNamePath,
      // ACL: "public-read",
      ContentType: /* required */ contentType,
      ContentEncoding: /* optional */ contentEncoding,
    };
    const command = new PutObjectCommand(bucketParams);
    return await this.getS3Instance().send(command);
  }

  async getSignedUrlForPutObject({ keyNamePath, contentType }: { keyNamePath: string; contentType: string }) {
    const bucketName: string = this.getUploadBucketName();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: keyNamePath,
      ContentType: contentType,
    });
    return await getSignedUrl(this.getS3Instance(), command, {
      expiresIn: this.SIGNED_URL_EXPIRE_IN,
    });
  }

  async getSignedUrlForGetObject({ keyNamePath }: { keyNamePath: string }) {
    const bucketName: string = this.getUploadBucketName();

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: keyNamePath,
    });
    return await getSignedUrl(this.getS3Instance(), command, {
      expiresIn: this.SIGNED_URL_EXPIRE_IN,
    });
  }

  async checkFileExists(fileKeyPath: string) {
    const bucketName: string = this.getUploadBucketName();

    try {
      const params: HeadObjectCommandInput = {
        Bucket: bucketName,
        Key: fileKeyPath,
      };

      const command = new HeadObjectCommand(params);
      await this.getS3Instance().send(command);
      return true;
    } catch (error: any) {
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
