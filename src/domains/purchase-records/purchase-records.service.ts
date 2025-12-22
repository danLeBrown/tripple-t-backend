import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { FindOptionsWhere, In, Repository } from 'typeorm';

import { ProductsService } from '../shared/products/products.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateSupplierPurchaseRecordDto } from './dto/create-supplier-purchase-record.dto';
import { SearchAndPaginatePurchaseRecordDto } from './dto/query-and-paginate-purchase-record.dto';
import { UpdatePurchaseRecordDto } from './dto/update-purchase-record.dto';
import { PurchaseRecord } from './entities/purchase-record.entity';
import { calculateTotalPrice } from './helpers';

@Injectable()
export class PurchaseRecordsService {
  constructor(
    @InjectRepository(PurchaseRecord)
    private readonly repo: Repository<PurchaseRecord>,
    private readonly productsService: ProductsService,
    private readonly suppliersService: SuppliersService,
    private readonly uploadsService: UploadsService,
  ) {}

  private async getUploadId(dto: CreateSupplierPurchaseRecordDto) {
    if (!dto.upload_id && !dto.upload) {
      throw new BadRequestException('Upload is required');
    }
    if (dto.upload_id) {
      const upload = await this.uploadsService.findOneByOrFail({
        id: dto.upload_id,
      });

      return upload.id;
    }
    return (await this.uploadsService.create(dto.upload!)).id;
  }

  async createForSuppliers(
    supplier_id: string,
    dto: CreateSupplierPurchaseRecordDto,
  ) {
    const supplier = await this.suppliersService.findOneByOrFail({
      id: supplier_id,
    });

    const upload_id = await this.getUploadId(dto);

    const products = await this.productsService.findBy({
      id: In(dto.purchase_records.map((record) => record.product_id)),
    });

    return this.repo.save(
      this.repo.create(
        dto.purchase_records.map((record) => ({
          ...record,
          supplier_id: supplier.id,
          upload_id,
          product_name: products.find(
            (product) => product.id === record.product_id,
          )?.name,
          supplier_name: supplier.business_name,
          total_price: calculateTotalPrice({
            quantity_in_bags: record.quantity_in_bags,
            price_per_bag: record.price_per_bag,
          }),
        })),
      ),
    );
  }

  async search(query: SearchAndPaginatePurchaseRecordDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('purchase_record');

    if (search_query) {
      qb.where('LOWER(purchase_record.product_name) LIKE :search_query')
        .orWhere('LOWER(purchase_record.supplier_name) LIKE :search_query')
        .orWhere(
          'CAST(purchase_record.quantity_in_bags AS TEXT) LIKE :search_query',
        )
        .orWhere(
          'CAST(purchase_record.price_per_bag AS TEXT) LIKE :search_query',
        )
        .orWhere('CAST(purchase_record.total_price AS TEXT) LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('purchase_record.purchased_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('purchase_record.purchased_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy(
        order_by === 'name'
          ? 'purchase_record.product_name'
          : 'purchase_record.purchased_at',
        order_direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneByOrFail(query: FindOptionsWhere<PurchaseRecord>) {
    const record = await this.repo.findOneBy(query);

    if (!record) {
      throw new NotFoundException('Purchase record not found');
    }

    return record;
  }

  async update(id: string, dto: UpdatePurchaseRecordDto) {
    const record = await this.findOneByOrFail({ id });

    let total_price = record.total_price;

    if (
      dto.price_per_bag !== undefined ||
      dto.quantity_in_bags !== undefined ||
      dto.purchased_at !== undefined
    ) {
      if (record.has_been_calculated) {
        throw new BadRequestException(
          'Purchase record has already been calculated',
        );
      }

      total_price = calculateTotalPrice({
        quantity_in_bags: dto.quantity_in_bags ?? record.quantity_in_bags,
        price_per_bag: dto.price_per_bag ?? record.price_per_bag,
      });
    }

    return this.repo.update(record.id, { ...dto, total_price });
  }

  async delete(id: string) {
    const record = await this.findOneByOrFail({ id });

    if (record.has_been_calculated) {
      throw new BadRequestException(
        'Purchase record has already been calculated',
      );
    }

    return this.repo.delete(record.id);
  }
}
