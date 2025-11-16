import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { CreateUploadDto } from '@/domains/uploads/dto/create-upload.dto';
import { UploadsService } from '@/domains/uploads/uploads.service';

import { CreateDocumentDto } from './dto/create-document.dto';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private repo: Repository<Document>,
    private uploadsService: UploadsService,
  ) {}

  async create(dto: CreateDocumentDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async createMany(dtos: CreateDocumentDto[]) {
    return this.repo.save(dtos.map((dto) => this.repo.create(dto)));
  }

  async createManyWithUrl(
    dtos: CreateUploadDto[],
    resource_options: Pick<CreateDocumentDto, 'resource_name' | 'resource_id'>,
  ) {
    const uploads = await this.uploadsService.createMany(dtos);

    return this.repo.save(
      dtos.map((dto) =>
        this.repo.create({
          ...resource_options,
          upload_id: uploads.find(
            (upload) => upload.relative_url === dto.relative_url,
          )?.id,
        }),
      ),
    );
  }

  async findBy(query?: FindOptionsWhere<Document>) {
    return this.repo.find({
      where: query,
      order: {
        created_at: 'ASC',
      },
    });
  }

  async findOneBy(query: FindOptionsWhere<Document>) {
    return this.repo.findOne({
      where: query,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Document>) {
    const document = await this.findOneBy(query);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async delete(id: string) {
    const document = await this.repo.findOneBy({ id });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const exe = await this.repo.delete(id);

    await this.uploadsService.delete(document.upload_id);

    return exe;
  }
}
