import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/create-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { Permission } from './entities/permission.entity';
import { slugifyPermission } from './helpers';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private repo: Repository<Permission>,
  ) {}

  async create(dto: CreatePermissionDto) {
    const slug = slugifyPermission(dto);
    const exists = await this.repo.exists({
      where: { slug },
    });

    if (exists) {
      throw new BadRequestException(
        `Permission with slug ${slug} already exists`,
      );
    }

    return this.repo.save(
      this.repo.create({
        ...dto,
        slug,
      }),
    );
  }

  async findBy(q?: QueryPermissionDto) {
    return this.repo.find({
      where: q,
    });
  }

  async findOneByOrFail(q: FindOptionsWhere<Permission>) {
    const permission = await this.repo.findOneBy(q);

    if (!permission) {
      throw new NotFoundException(`Permission not found`);
    }

    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const permission = await this.repo.findOneBy({ id });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    let slug = permission.slug;

    if (dto.subject || dto.action) {
      slug = slugifyPermission({
        subject: dto.subject ?? permission.subject,
        action: dto.action ?? permission.action,
      });

      const exists = await this.repo.exists({
        where: { slug, id: Not(id) },
      });

      if (exists) {
        throw new BadRequestException(
          `Permission with slug ${slug} already exists`,
        );
      }
    }

    return this.repo.update(id, {
      ...dto,
      slug,
    });
  }

  async delete(id: string) {
    const permission = await this.repo.findOneBy({ id });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return this.repo.delete(id);
  }
}
