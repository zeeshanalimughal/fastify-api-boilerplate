import AWS from "aws-sdk";
import fs from "fs";

export class S3Service {
  private s3: AWS.S3;
  private region: string;

  constructor({
    accessKeyId = process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY,
    region = process.env.AWS_REGION,
  }: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  } = {}) {
    this.s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    this.region = region || "us-east-1";
  }

  /**
   * Upload a file or buffer to S3
   */
  async upload({
    fileBufferOrPath,
    fileName,
    bucket,
    contentType,
    acl = "public-read",
  }: {
    fileBufferOrPath: Buffer | string;
    fileName: string;
    bucket: string;
    contentType: string;
    acl?: string;
  }): Promise<string> {
    let body: Buffer;
    if (Buffer.isBuffer(fileBufferOrPath)) {
      body = fileBufferOrPath;
    } else {
      body = fs.readFileSync(fileBufferOrPath);
    }
    const params = {
      Bucket: bucket,
      Key: fileName,
      Body: body,
      ContentType: contentType,
      ACL: acl,
    };
    const data = await this.s3.upload(params).promise();
    return data.Location;
  }

  async download({ fileName, bucket }: { fileName: string; bucket: string }): Promise<Buffer> {
    const params = { Bucket: bucket, Key: fileName };
    const data = await this.s3.getObject(params).promise();
    return data.Body as Buffer;
  }

  async delete({ fileName, bucket }: { fileName: string; bucket: string }): Promise<void> {
    const params = { Bucket: bucket, Key: fileName };
    await this.s3.deleteObject(params).promise();
  }

  async list({
    bucket,
    prefix = "",
    maxKeys = 100,
  }: {
    bucket: string;
    prefix?: string;
    maxKeys?: number;
  }): Promise<AWS.S3.ObjectList> {
    const params = { Bucket: bucket, Prefix: prefix, MaxKeys: maxKeys };
    const data = await this.s3.listObjectsV2(params).promise();
    return data.Contents || [];
  }

  /**
   * Generate a signed URL for downloading (GET) an S3 object
   */
  getDownloadUrl({
    fileName,
    bucket,
    expires = 60 * 5,
  }: {
    fileName: string;
    bucket: string;
    expires?: number;
  }): string {
    return this.s3.getSignedUrl("getObject", {
      Bucket: bucket,
      Key: fileName,
      Expires: expires,
    });
  }

  /**
   * Generate a signed URL for uploading (PUT) an S3 object
   */
  getUploadUrl({
    fileName,
    bucket,
    contentType,
    expires = 60 * 5,
    acl = "public-read",
  }: {
    fileName: string;
    bucket: string;
    contentType?: string;
    expires?: number;
    acl?: string;
  }): string {
    const params: unknown = {
      Bucket: bucket,
      Key: fileName,
      Expires: expires,
      ACL: acl,
    };
    if (contentType) (params as unknown as { ContentType: string }).ContentType = contentType;
    return this.s3.getSignedUrl("putObject", params as unknown as AWS.S3.PutObjectRequest);
  }

  /**
   * Generate a custom signed URL for any S3 operation
   */
  getSignedUrl({
    fileName,
    bucket,
    expires = 60 * 5,
    operation = "getObject",
    contentType,
    acl,
  }: {
    fileName: string;
    bucket: string;
    expires?: number;
    operation?: "getObject" | "putObject" | string;
    contentType?: string;
    acl?: string;
  }): string {
    const params: unknown = {
      Bucket: bucket,
      Key: fileName,
      Expires: expires,
    };
    if (contentType) (params as unknown as { ContentType: string }).ContentType = contentType;
    if (acl) (params as unknown as { ACL: string }).ACL = acl;
    return this.s3.getSignedUrl(operation, params as unknown as AWS.S3.GetObjectRequest);
  }

  async exists({ fileName, bucket }: { fileName: string; bucket: string }): Promise<boolean> {
    try {
      await this.s3.headObject({ Bucket: bucket, Key: fileName }).promise();
      return true;
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === "NotFound"
      )
        return false;
      throw err;
    }
  }

  async copy({
    sourceBucket,
    sourceKey,
    destinationBucket,
    destinationKey,
    acl = "public-read",
  }: {
    sourceBucket: string;
    sourceKey: string;
    destinationBucket: string;
    destinationKey: string;
    acl?: string;
  }): Promise<void> {
    const params = {
      Bucket: destinationBucket,
      CopySource: `/${sourceBucket}/${sourceKey}`,
      Key: destinationKey,
      ACL: acl,
    };
    await this.s3.copyObject(params).promise();
  }

  /**
   * Get the public URL of an S3 object (if ACL allows)
   */
  getObjectUrl({
    fileName,
    bucket,
    region = this.region,
  }: {
    fileName: string;
    bucket: string;
    region?: string;
  }): string {
    return `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
  }

  /**
   * Parse an S3 URI (s3://bucket/key) into bucket and key
   */
  static parseUri(uri: string): { bucket: string; key: string } {
    const match = uri.match(/^s3:\/\/([^/]+)\/(.+)$/);
    if (!match) throw new Error("Invalid S3 URI");
    return { bucket: match[1], key: match[2] };
  }

  /**
   * Get metadata for an S3 object
   */
  async getMetadata({
    fileName,
    bucket,
  }: {
    fileName: string;
    bucket: string;
  }): Promise<AWS.S3.HeadObjectOutput> {
    return this.s3.headObject({ Bucket: bucket, Key: fileName }).promise();
  }
}
