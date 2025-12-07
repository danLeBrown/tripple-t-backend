import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { FindOptionsWhere, Repository } from 'typeorm';

import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SearchAndPaginateSupplierDto } from './dto/query-and-paginate-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  @InjectRepository(Supplier)
  private readonly repo: Repository<Supplier>;

  async create(dto: CreateSupplierDto) {
    const supplier = this.repo.create({ ...dto, status: 'active' });

    const exists = await this.repo.findOne({
      where: [
        {
          contact_person_email: supplier.contact_person_email ?? undefined,
          contact_person_phone_number: supplier.contact_person_phone_number,
        },
      ],
    });

    if (exists) {
      throw new BadRequestException(
        'Supplier with this contact person email or phone number already exists',
      );
    }

    return this.repo.save(supplier);
  }

  async search(query: SearchAndPaginateSupplierDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'business_name',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('supplier');

    if (search_query) {
      qb.where('LOWER(supplier.business_name) LIKE :search_query')
        .orWhere('LOWER(supplier.contact_person_first_name) LIKE :search_query')
        .orWhere('LOWER(supplier.contact_person_last_name) LIKE :search_query')
        .orWhere('LOWER(supplier.contact_person_email) LIKE :search_query')
        .orWhere('supplier.contact_person_phone_number LIKE :search_query')
        .orWhere('supplier.status LIKE :search_query')
        .orWhere('supplier.address LIKE :search_query')
        .orWhere('supplier.state LIKE :search_query')
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
        order_by === 'business_name'
          ? 'supplier.business_name'
          : 'supplier.created_at',
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

    const qb = this.repo.createQueryBuilder('supplier').where('1=1');

    if (dto.contact_person_email || dto.contact_person_phone_number) {
      qb.andWhere(
        // eslint-disable-next-line max-len
        `(${dto.contact_person_email ? 'supplier.contact_person_email = :contact_person_email' : '1=1'} OR ${dto.contact_person_phone_number ? 'supplier.contact_person_phone_number = :contact_person_phone_number' : '1=1'})`,
        {
          contact_person_email: dto.contact_person_email ?? undefined,
          contact_person_phone_number:
            dto.contact_person_phone_number ?? undefined,
        },
      ).andWhere('supplier.id != :id', { id });
    }

    const exists = await qb.getExists();

    if (exists) {
      throw new BadRequestException(
        'Supplier with this contact person email or phone number already exists',
      );
    }

    return this.repo.update(supplier.id, dto);
  }
}
