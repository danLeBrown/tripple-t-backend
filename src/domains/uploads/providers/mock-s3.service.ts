import { Injectable } from '@nestjs/common';

import { IUploadService } from '../interfaces/upload';

@Injectable()
export class MockS3Service implements IUploadService {
  async upload(file: Express.Multer.File): Promise<string | null> {
    const random = Math.random().toString(36).substring(7);

    const getExtension = (filename: string) => {
      const parts = filename.split('.');
      return parts[parts.length - 1];
    };

    const generatedFilename = `${random}.${getExtension(file.originalname)}`;

    // Simulate successful upload
    return `mock-bucket/${generatedFilename}`;
  }

  async presignedURL(type: 'GET' | 'PUT', key: string, _extension?: string) {
    // Simulate a signed URL
    return Promise.resolve({
      key,
      url: `https://mock-s3-service.com/${key}`,
    });
  }

  async delete(key: string): Promise<void> {
    // Simulate successful deletion
    console.log(`Mock delete called for key: ${key}`);
  }
}
