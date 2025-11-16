import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import path from 'path';

import { AppConfigService } from '@/app-configs/app-config.service';
import {
  generateObjectKey,
  getFileMimeTypeFromKey,
} from '@/helpers/file.helper';

import { parseS3Requirement } from '../helpers/s3';
import { IUploadService } from '../interfaces/upload';
@Injectable()
export class S3Service implements IUploadService {
  private client: S3;

  private bucket: string;
  private cdnEndpoint: string;

  private expiresIn = 60; // 1 minute

  constructor(private configService: AppConfigService) {
    const {
      accessKeyId,
      secretAccessKey,
      bucket,
      region,
      endpoint,
      cdnEndpoint,
    } = parseS3Requirement(this.configService);

    this.bucket = bucket;
    this.cdnEndpoint = cdnEndpoint;

    this.client = new S3({
      forcePathStyle: false,
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(file: Express.Multer.File): Promise<string | null> {
    const fileExtension = path.extname(file.originalname);
    const key = generateObjectKey(fileExtension);
    try {
      const uploadedImage = await new Upload({
        client: this.client,
        params: {
          Bucket: this.configService.get('SPACES_BUCKET'),
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      }).done();

      return uploadedImage.Key ?? key;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async presignedURL(type: 'GET' | 'PUT', key: string, file_mimetype?: string) {
    if (type === 'GET') {
      return {
        key,
        url: await getSignedUrl(
          this.client,
          new GetObjectCommand({
            Key: key,
            Bucket: this.bucket,
          }),
          { expiresIn: this.expiresIn },
        ),
      };
    }

    return {
      key,
      url: await getSignedUrl(
        this.client,
        new PutObjectCommand({
          Key: key,
          Bucket: this.bucket,
          ContentType: file_mimetype ?? getFileMimeTypeFromKey(key),
        }),
        { expiresIn: this.expiresIn },
      ),
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Key: key,
        Bucket: this.bucket,
      }),
    );
  }
}
