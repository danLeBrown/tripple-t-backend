import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, firstValueFrom } from 'rxjs';
import { FindOptionsWhere, Repository } from 'typeorm';

import { AppConfigService } from '@/app-configs/app-config.service';
import { generateObjectKey } from '@/helpers/file.helper';

import { CreateUploadDto } from './dto/create-upload.dto';
import { Upload } from './entities/upload.entity';
import { IUploadService } from './interfaces/upload';

@Injectable()
export class UploadsService {
  logger = new Logger(UploadsService.name);
  private proxyBaseURL: string;

  constructor(
    @InjectRepository(Upload)
    private repo: Repository<Upload>,
    @Inject('IUploadService')
    private s3Service: IUploadService,
    private configService: AppConfigService,
    private httpService: HttpService,
  ) {
    this.proxyBaseURL = this.configService.get('UPLOAD_PROXY_BASE_URL');
  }

  async upload(name: string, file: Express.Multer.File) {
    const exe = await this.s3Service.upload(file);

    if (!exe) {
      throw new BadRequestException(
        'An error occurred while uploading the file.',
      );
    }

    return this.create({
      name,
      relative_url: exe,
    });
  }

  async create(dto: CreateUploadDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async createMany(dtos: CreateUploadDto[]) {
    return this.repo.save(dtos.map((dto) => this.repo.create(dto)));
  }

  async findBy(query?: FindOptionsWhere<Upload>) {
    return this.repo.find({
      where: query,
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOneBy(query: FindOptionsWhere<Upload>) {
    return this.repo.findOne({
      where: query,
    });
  }

  async presignedURL(dto: {
    action: 'upload' | 'download';
    key?: string;
    file_mimetype?: string;
  }) {
    if (this.proxyBaseURL) {
      return this.getPresignedURLFromProxy(dto);
    }

    if (dto.action === 'download') {
      if (!dto.key) {
        throw new BadRequestException('Key is required for download action');
      }

      return this.s3Service.presignedURL('GET', dto.key);
    }

    if (!dto.file_mimetype) {
      throw new BadRequestException(
        'File mime type is required for upload action',
      );
    }

    return this.s3Service.presignedURL(
      'PUT',
      generateObjectKey(dto.file_mimetype),
      dto.file_mimetype,
    );
  }

  async delete(id: string) {
    const upload = await this.repo.findOneBy({ id });

    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    await this.s3Service.delete(upload.relative_url);

    return this.repo.delete(id);
  }

  private async getPresignedURLFromProxy(dto: {
    action: 'upload' | 'download';
    key?: string;
    file_mimetype?: string;
  }) {
    if (dto.action === 'download') {
      if (!dto.key) {
        throw new BadRequestException('Key is required for download action');
      }

      const exe = await firstValueFrom(
        this.httpService
          .post<{
            data: { url: string; key: string };
          }>(`${this.proxyBaseURL}/v1/uploads/presigned-url/download`, {
            key: dto.key,
          })
          .pipe(
            catchError((error) => {
              this.logger.error(
                `Error fetching presigned URL from proxy: ${error.message}`,
                error.stack,
              );
              throw new BadRequestException('Failed to generate presigned URL');
            }),
          ),
      );

      return exe.data;
    }

    if (!dto.file_mimetype) {
      throw new BadRequestException(
        'File mime type is required for upload action',
      );
    }

    const exe = await firstValueFrom(
      this.httpService
        .post<{
          data: { url: string; key: string };
        }>(`${this.proxyBaseURL}/v1/uploads/presigned-url/upload`, {
          file_mimetype: dto.file_mimetype,
        })
        .pipe(
          catchError((error) => {
            this.logger.error(
              `Error fetching presigned URL from proxy: ${error.message}`,
              error.stack,
            );
            throw new BadRequestException('Failed to generate presigned URL');
          }),
        ),
    );

    return exe.data;
  }
}
