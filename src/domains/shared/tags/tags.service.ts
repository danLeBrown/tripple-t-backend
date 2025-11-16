import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';

import { slugify } from '@/helpers/string.helper';

import { CreateTagDto, UpdateTagDto } from './dto/create-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private repo: Repository<Tag>,
  ) {}

  async create(dto: CreateTagDto) {
    const slug = slugify(dto.value);

    const exists = await this.repo.exists({
      where: {
        resource_name: dto.resource_name,
        resource_id: dto.resource_id,
        slug,
      },
    });

    if (exists) {
      throw new BadRequestException('Tag already exists');
    }

    return this.repo.save(this.repo.create({ ...dto, slug }));
  }

  async createMany(dtos: CreateTagDto[]) {
    const slugs = dtos.map((dto) => slugify(dto.value));
    const existingTags = await this.repo.find({
      where: dtos.map((dto) => ({
        resource_name: dto.resource_name,
        resource_id: dto.resource_id,
        slug: slugify(dto.value),
      })),
    });

    if (existingTags.length) {
      const existingSlugs = existingTags.map((tag) => tag.slug);
      const duplicateTags = dtos.filter((dto) =>
        existingSlugs.includes(slugify(dto.value)),
      );

      throw new BadRequestException(
        `Tags already exist: ${duplicateTags.map((dto) => dto.value).join(', ')}`,
      );
    }
    const newTags = dtos.map((dto, index) => ({
      ...dto,
      slug: slugs[index],
    }));
    return this.repo.save(this.repo.create(newTags));
  }

  async findBy(query?: FindOptionsWhere<Tag>) {
    return this.repo.find({
      where: query,
      order: {
        created_at: 'ASC',
      },
    });
  }

  async findOneBy(query: FindOptionsWhere<Tag>) {
    const tag = await this.repo.findOne({
      where: query,
    });

    if (!tag) {
      throw new BadRequestException('Tag not found');
    }

    return tag;
  }

  async delete(id: string) {
    const tag = await this.repo.findOneBy({ id });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return this.repo.delete(id);
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await this.repo.findOneBy({ id });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    let slug = tag.slug;

    if (dto.value) {
      slug = slugify(dto.value);

      const exists = await this.repo.exists({
        where: {
          resource_name: dto.resource_name,
          resource_id: dto.resource_id,
          slug,
          id: Not(id), // Ensure we are not checking the same tag
        },
      });

      if (exists) {
        throw new BadRequestException('Tag already exists');
      }
    }

    return this.repo.update(id, {
      ...dto,
      slug,
    });
  }

  getTagRepo() {
    return this.repo;
  }
}
