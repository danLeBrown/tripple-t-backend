import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns/getUnixTime';
import { FindOptionsWhere, Not, Repository } from 'typeorm';

import { slugify } from '@/helpers/string.helper';

import { CreateUnitDto } from './dto/create-unit.dto';
import { SearchAndPaginateUnitDto } from './dto/query-and-paginate-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly repo: Repository<Unit>,
  ) {}

  private generateSlug(name: string) {
    return slugify(name);
  }

  async create(dto: CreateUnitDto) {
    const slug = this.generateSlug(dto.name);

    const exists = await this.repo.findOne({
      where: { slug },
    });

    if (exists) {
      throw new BadRequestException('Unit with this name already exists');
    }

    const unit = this.repo.create({ ...dto, slug });

    return this.repo.save(unit);
  }

  async search(query: SearchAndPaginateUnitDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('unit');

    if (search_query) {
      qb.where('LOWER(unit.name) LIKE :search_query')
        .orWhere('LOWER(unit.symbol) LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('unit.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('unit.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy(
        order_by === 'name' ? 'unit.name' : 'unit.created_at',
        order_direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneBy(query: FindOptionsWhere<Unit>) {
    return this.repo.findOne({
      where: query,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Unit>) {
    const unit = await this.findOneBy(query);

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  async update(id: string, dto: UpdateUnitDto) {
    const unit = await this.findOneByOrFail({ id });

    const slug = this.generateSlug(dto.name ?? unit.name);

    const exists = await this.repo.exists({
      where: { slug, id: Not(unit.id) },
    });

    if (exists) {
      throw new BadRequestException('Unit with this name already exists');
    }

    return this.repo.update(unit.id, dto);
  }
}
