import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns/getUnixTime';
import { FindOptionsWhere, Not, Repository } from 'typeorm';

import { slugify } from '@/helpers/string.helper';

import { CreateColourDto } from './dto/create-colour.dto';
import { SearchAndPaginateColourDto } from './dto/query-and-paginate-colour.dto';
import { UpdateColourDto } from './dto/update-colour.dto';
import { Colour } from './entities/colour.entity';

@Injectable()
export class ColoursService {
  constructor(
    @InjectRepository(Colour)
    private readonly repo: Repository<Colour>,
  ) {}

  private generateSlug(name: string) {
    return slugify(name);
  }

  async create(dto: CreateColourDto) {
    const slug = this.generateSlug(dto.name);

    const exists = await this.repo.findOne({
      where: { slug },
    });

    if (exists) {
      throw new BadRequestException('Colour with this name already exists');
    }

    const colour = this.repo.create({ ...dto, slug });

    return this.repo.save(colour);
  }

  async search(query: SearchAndPaginateColourDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('colour');

    if (search_query) {
      qb.where('LOWER(colour.name) LIKE :search_query').setParameter(
        'search_query',
        `%${search_query.toLowerCase()}%`,
      );
    }

    if (from_time) {
      qb.andWhere('colour.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('colour.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy(
        order_by === 'name' ? 'colour.name' : 'colour.created_at',
        order_direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneBy(query: FindOptionsWhere<Colour>) {
    return this.repo.findOne({
      where: query,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Colour>) {
    const colour = await this.findOneBy(query);

    if (!colour) {
      throw new NotFoundException('Colour not found');
    }

    return colour;
  }

  async update(id: string, dto: UpdateColourDto) {
    const colour = await this.findOneByOrFail({ id });

    const slug = this.generateSlug(dto.name ?? colour.name);

    const exists = await this.repo.findOne({
      where: { slug, id: Not(id) },
    });

    if (exists) {
      throw new BadRequestException('Colour with this name already exists');
    }

    return this.repo.update(colour.id, dto);
  }
}
