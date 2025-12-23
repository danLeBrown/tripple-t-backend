import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';

import { ProductsService } from '../shared/products/products.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreateBottleProductionDto } from './dto/create-bottle-production.dto';
import { SearchAndPaginateBottleProductionDto } from './dto/query-and-paginate-bottle-production.dto';
import { UpdateBottleProductionDto } from './dto/update-bottle-production.dto';
import { BottleProduction } from './entities/bottle-production.entity';

@Injectable()
export class BottleProductionsService {
  constructor(
    @InjectRepository(BottleProduction)
    private readonly repo: Repository<BottleProduction>,
    private readonly suppliersService: SuppliersService,
    private readonly productsService: ProductsService,
  ) {}

  private validateQuantities(
    used: number,
    defective: number,
    type: 'preforms' | 'bottles',
  ): void {
    if (defective > used) {
      throw new BadRequestException(
        `Number of defective ${type} cannot exceed number of ${type} used/produced`,
      );
    }
  }

  async create(dto: CreateBottleProductionDto) {
    // Validate quantities
    this.validateQuantities(
      dto.preforms_used,
      dto.preforms_defective,
      'preforms',
    );
    this.validateQuantities(
      dto.bottles_produced,
      dto.bottles_defective,
      'bottles',
    );

    const supplier = await this.suppliersService.findOneByOrFail({
      id: dto.preform_supplier_id,
    });

    const preformProduct = await this.productsService.findOneByOrFail({
      id: dto.preform_product_id,
    });

    const bottleProduct = await this.productsService.findOneByOrFail({
      id: dto.bottle_product_id,
    });

    // Default bottle_color to preform_color if not provided
    const bottle_color = dto.bottle_color ?? preformProduct.colour;

    const production = this.repo.create({
      ...dto,
      supplier_name: supplier.business_name,
      preform_name: preformProduct.name,
      bottle_name: bottleProduct.name,
      preform_color: preformProduct.colour,
      bottle_color,
    });

    return this.repo.save(production);
  }

  async search(query: SearchAndPaginateBottleProductionDto) {
    const {
      query: search_query,
      // customer_id,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'produced_at',
      order_direction = 'desc',
    } = query;

    const qb = this.repo
      .createQueryBuilder('production')
      .leftJoinAndSelect('production.supplier', 'supplier')
      .leftJoinAndSelect('production.preform_product', 'preform_product')
      .leftJoinAndSelect('production.bottle_product', 'bottle_product')
      .where('production.deleted_at IS NULL');

    if (search_query) {
      qb.andWhere(
        '(LOWER(production.preform_name) LIKE :search_query OR ' +
          'LOWER(production.bottle_name) LIKE :search_query OR ' +
          'LOWER(production.supplier_name) LIKE :search_query OR ' +
          'LOWER(production.preform_color) LIKE :search_query OR ' +
          'LOWER(production.bottle_color) LIKE :search_query OR ' +
          'CAST(production.preform_size AS TEXT) LIKE :search_query OR ' +
          'CAST(production.bottle_size AS TEXT) LIKE :search_query)',
      ).setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('production.produced_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('production.produced_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    const validOrderByFields = [
      'produced_at',
      'preform_name',
      'preform_size',
      'bottle_size',
      'created_at',
    ];
    const orderField = validOrderByFields.includes(order_by)
      ? `production.${order_by}`
      : 'production.produced_at';

    return qb
      .orderBy(orderField, order_direction.toUpperCase() as 'ASC' | 'DESC')
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneByOrFail(query: FindOptionsWhere<BottleProduction>) {
    const production = await this.repo.findOne({
      where: { ...query, deleted_at: IsNull() },
      relations: {
        supplier: true,
        preform_product: true,
        bottle_product: true,
      },
    });

    if (!production) {
      throw new NotFoundException('Bottle production record not found');
    }

    return production;
  }

  async update(id: string, dto: UpdateBottleProductionDto) {
    const production = await this.findOneByOrFail({ id });

    // Validate quantities if provided
    const preforms_used = dto.preforms_used ?? production.preforms_used;
    const preforms_defective =
      dto.preforms_defective ?? production.preforms_defective;
    const bottles_produced =
      dto.bottles_produced ?? production.bottles_produced;
    const bottles_defective =
      dto.bottles_defective ?? production.bottles_defective;

    this.validateQuantities(preforms_used, preforms_defective, 'preforms');
    this.validateQuantities(bottles_produced, bottles_defective, 'bottles');

    return this.repo.update(production.id, {
      ...dto,
      bottle_color: dto.bottle_color ?? undefined,
    });
  }

  async delete(id: string) {
    const production = await this.findOneByOrFail({ id });

    return this.repo.update(production.id, {
      deleted_at: Math.floor(Date.now() / 1000),
    });
  }
}
