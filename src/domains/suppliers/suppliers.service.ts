import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { FindOptionsWhere, Repository } from 'typeorm';

import { CreateSupplierDto } from './dto/create-supplier.dto';
import {
  QueryAndPaginateSupplierDto,
  SearchAndPaginateSupplierDto,
} from './dto/query-and-paginate-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  @InjectRepository(Supplier)
  private readonly repo: Repository<Supplier>;

  async create(dto: CreateSupplierDto) {
    const supplier = this.repo.create(dto);

    const exists = await this.repo.findOne({
      where: [
        {
          email: supplier.email,
          phone_number: supplier.phone_number,
        },
      ],
    });

    if (exists) {
      throw new BadRequestException(
        'Supplier with this email or phone number already exists',
      );
    }

    return this.repo.save(supplier);
  }

  async findBy(query: QueryAndPaginateSupplierDto) {
    const {
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
      ...rest
    } = query;

    return this.repo.findAndCount({
      where: rest,
      order: {
        [order_by === 'name' ? 'first_name' : 'created_at']: order_direction,
      },
      take: limit > 0 ? limit : undefined,
      skip: page && limit ? (page - 1) * limit : undefined,
    });
  }

  async search(query: SearchAndPaginateSupplierDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('supplier');

    if (search_query) {
      qb.where(
        'LOWER(supplier.first_name) LIKE :search_query OR LOWER(supplier.last_name) LIKE :search_query',
      )
        .orWhere('LOWER(supplier.email) LIKE :search_query')
        .orWhere('supplier.phone_number LIKE :search_query')
        .orWhere('supplier.status LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('supplier.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('supplier.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy(
        order_by === 'name' ? 'supplier.first_name' : 'supplier.created_at',
        order_direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneBy(query: FindOptionsWhere<Supplier>) {
    return this.repo.findOne({
      where: query,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Supplier>) {
    const supplier = await this.findOneBy(query);

    if (!supplier) {
      throw new NotFoundException('Supplier  not found');
    }

    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const supplier = await this.findOneByOrFail({ id });

    return this.repo.update(supplier.id, dto);
  }
}
