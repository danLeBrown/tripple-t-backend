import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns/getUnixTime';
import { FindOptionsWhere, Not, Repository } from 'typeorm';

import { slugify } from '@/helpers/string.helper';

import { CreateProductDto } from './dto/create-product.dto';
import { SearchAndPaginateProductDto } from './dto/query-and-paginate-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  private generateSlug(data: {
    type: string;
    size: number;
    colour: string;
    unit: string;
  }) {
    return slugify(`${data.type}_${data.size}_${data.colour}_${data.unit}`);
  }

  async create(dto: CreateProductDto) {
    const slug = this.generateSlug(dto);

    const exists = await this.repo.findOne({
      where: { slug },
    });

    if (exists) {
      throw new BadRequestException(
        'Product with this type, size, colour, and unit combination already exists',
      );
    }

    const product = this.repo.create({ ...dto, slug });

    return this.repo.save(product);
  }

  async search(query: SearchAndPaginateProductDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'type',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('product');

    if (search_query) {
      qb.where('LOWER(product.type) LIKE :search_query')
        .orWhere('CAST(product.size AS TEXT) LIKE :search_query')
        .orWhere('LOWER(product.colour) LIKE :search_query')
        .orWhere('LOWER(product.unit) LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('product.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('product.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy(
        order_by === 'name' ? 'product.name' : 'product.created_at',
        order_direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneBy(query: FindOptionsWhere<Product>) {
    return this.repo.findOne({
      where: query,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Product>) {
    const product = await this.findOneBy(query);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOneByOrFail({ id });

    const slug = this.generateSlug({
      type: dto.type ?? product.type,
      size: dto.size ?? product.size,
      colour: dto.colour ?? product.colour,
      unit: dto.unit ?? product.unit,
    });

    const exists = await this.repo.exists({
      where: { slug, id: Not(product.id) },
    });

    if (exists) {
      throw new BadRequestException(
        'Product with this type, size, colour, and unit combination already exists',
      );
    }

    return this.repo.update(product.id, dto);
  }
}
