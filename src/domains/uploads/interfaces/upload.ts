export interface IUploadService {
  upload(file: Express.Multer.File): Promise<string | null>;
  presignedURL(
    type: 'GET' | 'PUT',
    key: string,
    file_mimetype?: string,
  ): Promise<{
    key: string;
    url: string;
  }>;
  delete(key: string): Promise<void>;
}
