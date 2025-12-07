import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { FindOptionsWhere, Repository } from 'typeorm';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { SearchAndPaginateCustomerDto } from './dto/query-and-paginate-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  @InjectRepository(Customer)
  private readonly repo: Repository<Customer>;

  async create(dto: CreateCustomerDto) {
    const customer = this.repo.create({ ...dto, status: 'active' });

    const exists = await this.repo.findOne({
      where: [
        {
          contact_person_email: customer.contact_person_email ?? undefined,
          contact_person_phone_number: customer.contact_person_phone_number,
        },
      ],
    });

    if (exists) {
      throw new BadRequestException(
        'Customer with this contact person email or phone number already exists',
      );
    }

    return this.repo.save(customer);
  }

  async search(query: SearchAndPaginateCustomerDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'business_name',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('customer');

    if (search_query) {
      qb.where('LOWER(customer.business_name) LIKE :search_query')
        .orWhere('LOWER(customer.contact_person_first_name) LIKE :search_query')
        .orWhere('LOWER(customer.contact_person_last_name) LIKE :search_query')
        .orWhere('LOWER(customer.contact_person_email) LIKE :search_query')
        .orWhere('customer.contact_person_phone_number LIKE :search_query')
        .orWhere('customer.status LIKE :search_query')
        .orWhere('customer.address LIKE :search_query')
        .orWhere('customer.state LIKE :search_query')
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
        order_by === 'business_name'
          ? 'customer.business_name'
          : 'customer.created_at',
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

    const qb = this.repo.createQueryBuilder('customer').where('1=1');

    if (dto.contact_person_email || dto.contact_person_phone_number) {
      qb.andWhere(
        // eslint-disable-next-line max-len
        `(${dto.contact_person_email ? 'customer.contact_person_email = :contact_person_email' : '1=1'} OR ${dto.contact_person_phone_number ? 'customer.contact_person_phone_number = :contact_person_phone_number' : '1=1'})`,
        {
          contact_person_email: dto.contact_person_email ?? undefined,
          contact_person_phone_number:
            dto.contact_person_phone_number ?? undefined,
        },
      ).andWhere('customer.id != :id', { id });
    }

    const exists = await qb.getExists();

    if (exists) {
      throw new BadRequestException(
        'Customer with this contact person email or phone number already exists',
      );
    }

    return this.repo.update(customer.id, dto);
  }
}
