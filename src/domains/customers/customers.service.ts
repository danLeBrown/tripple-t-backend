import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { FindOptionsWhere, Repository } from 'typeorm';

import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  QueryAndPaginateCustomerDto,
  SearchAndPaginateCustomerDto,
} from './dto/query-and-paginate-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  @InjectRepository(Customer)
  private readonly repo: Repository<Customer>;

  async create(dto: CreateCustomerDto) {
    const customer = this.repo.create(dto);

    const exists = await this.repo.findOne({
      where: [
        {
          email: customer.email,
          phone_number: customer.phone_number,
        },
      ],
    });

    if (exists) {
      throw new BadRequestException(
        'Customer with this email or phone number already exists',
      );
    }

    return this.repo.save(customer);
  }

  async findBy(query: QueryAndPaginateCustomerDto) {
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

  async search(query: SearchAndPaginateCustomerDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('customer');

    if (search_query) {
      qb.where(
        'LOWER(customer.first_name) LIKE :search_query OR LOWER(customer.last_name) LIKE :search_query',
      )
        .orWhere('LOWER(customer.email) LIKE :search_query')
        .orWhere('customer.phone_number LIKE :search_query')
        .orWhere('customer.status LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('customer.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('customer.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy(
        order_by === 'name' ? 'customer.first_name' : 'customer.created_at',
        order_direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneBy(query: FindOptionsWhere<Customer>) {
    return this.repo.findOne({
      where: query,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Customer>) {
    const customer = await this.findOneBy(query);

    if (!customer) {
      throw new NotFoundException('Customer  not found');
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.findOneByOrFail({ id });

    this.repo.update(customer.id, dto);
  }
}
