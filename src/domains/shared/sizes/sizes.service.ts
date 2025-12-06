import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns/getUnixTime';
import { FindOptionsWhere, Repository } from 'typeorm';

import { CreateSizeDto } from './dto/create-size.dto';
import { SearchAndPaginateSizeDto } from './dto/query-and-paginate-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { Size } from './entities/size.entity';

@Injectable()
export class SizesService {
  constructor(
    @InjectRepository(Size)
    private readonly repo: Repository<Size>,
  ) {}

  async create(dto: CreateSizeDto) {
    const exists = await this.repo.findOne({
      where: { value: dto.value },
    });

    if (exists) {
      throw new BadRequestException('Size with this value already exists');
    }

    const size = this.repo.create(dto);

    return this.repo.save(size);
  }

  async search(query: SearchAndPaginateSizeDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'value',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('size');

    if (search_query) {
      qb.where('LOWER(size.value) LIKE :search_query').setParameter(
        'search_query',
        `%${search_query.toLowerCase()}%`,
      );
    }

    if (from_time) {
      qb.andWhere('size.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('size.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy(
        order_by === 'value' ? 'size.value' : 'size.created_at',
        order_direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneBy(query: FindOptionsWhere<Size>) {
    return this.repo.findOne({
      where: query,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Size>) {
    const size = await this.findOneBy(query);

    if (!size) {
      throw new NotFoundException('Size not found');
    }

    return size;
  }

  async update(id: string, dto: UpdateSizeDto) {
    const size = await this.findOneByOrFail({ id });

    return this.repo.update(size.id, dto);
  }
}
