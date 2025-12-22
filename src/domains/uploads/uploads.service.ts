import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { FindOptionsWhere, Repository } from 'typeorm';

import { generateObjectKey } from '@/helpers/file.helper';

import { CreateUploadDto } from './dto/create-upload.dto';
import { SearchAndPaginateUploadDto } from './dto/query-and-paginate-upload.dto';
import { Upload } from './entities/upload.entity';
import { IUploadService } from './interfaces/upload';

@Injectable()
export class UploadsService {
  logger = new Logger(UploadsService.name);

  constructor(
    @InjectRepository(Upload)
    private repo: Repository<Upload>,
    @Inject('IUploadService')
    private s3Service: IUploadService,
  ) {}

  async upload(
    dto: {
      name: string;
      file_mimetype: string;
      file_size: number;
    },
    file: Express.Multer.File,
  ) {
    const exe = await this.s3Service.upload(file);

    if (!exe) {
      throw new BadRequestException(
        'An error occurred while uploading the file.',
      );
    }

    return this.create({
      ...dto,
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

  async search(query: SearchAndPaginateUploadDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'created_at',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('upload');

    if (search_query) {
      qb.where('LOWER(upload.name) LIKE :search_query')
        .orWhere('LOWER(upload.relative_url) LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('upload.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('upload.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy(
        order_by === 'name' ? 'upload.name' : 'upload.created_at',
        order_direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }
}
