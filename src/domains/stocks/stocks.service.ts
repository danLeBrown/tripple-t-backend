import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { DataSource } from 'typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { ProductsService } from '../shared/products/products.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { SearchAndPaginateStockDto } from './dto/query-and-paginate-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from './entities/stock.entity';
import { StockHistory } from './entities/stock-history.entity';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private readonly repo: Repository<Stock>,
    @InjectRepository(StockHistory)
    private readonly historyRepo: Repository<StockHistory>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateStockDto) {
    const product = await this.productsService.findOneByOrFail({
      id: dto.product_id,
    });

    // Check if stock already exists
    const existingStock = await this.repo.findOne({
      where: { product_id: dto.product_id },
    });

    if (existingStock) {
      throw new BadRequestException('Stock for this product already exists');
    }

    const stock = this.repo.create({
      ...dto,
      quantity: dto.quantity ?? 0,
      unit: dto.unit ?? product.unit,
    });

    return this.repo.save(stock);
  }

  async findOneBy(query: FindOptionsWhere<Stock>) {
    return this.repo.findOne({
      where: query,
      relations: ['product'],
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Stock>) {
    const stock = await this.findOneBy(query);

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    return stock;
  }

  async search(query: SearchAndPaginateStockDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'created_at',
      order_direction = 'desc',
    } = query;

    const qb = this.repo
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product');

    if (search_query) {
      qb.where('LOWER(product.name) LIKE :search_query')
        .orWhere('LOWER(product.type) LIKE :search_query')
        .orWhere('LOWER(product.colour) LIKE :search_query')
        .orWhere('LOWER(stock.unit) LIKE :search_query')
        .orWhere('CAST(stock.quantity AS TEXT) LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('stock.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('stock.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    const validOrderByFields = ['created_at', 'quantity'];
    const orderField = validOrderByFields.includes(order_by)
      ? `stock.${order_by}`
      : 'stock.created_at';

    return qb
      .orderBy(orderField, order_direction.toUpperCase() as 'ASC' | 'DESC')
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async adjustQuantity(
    productId: string,
    delta: number,
    adjustmentType: string,
    reason?: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const stock = await manager.findOne(Stock, {
        where: { product_id: productId },
        lock: { mode: 'pessimistic_write' },
        relations: ['product'],
      });

      if (!stock) {
        throw new NotFoundException('Stock not found');
      }

      const quantityBefore = Number(stock.quantity);
      const newQuantity = quantityBefore + delta;

      if (newQuantity < 0) {
        throw new BadRequestException('Insufficient stock');
      }

      // Update stock using manager.update()
      await manager.update(
        Stock,
        { product_id: productId },
        {
          quantity: newQuantity,
        },
      );

      // Create history entry
      await manager.save(StockHistory, {
        stock_id: stock.id,
        adjustment_type: adjustmentType,
        quantity_delta: delta,
        quantity_before: quantityBefore,
        quantity_after: newQuantity,
        reason: reason || null,
      });

      // Return updated stock
      return manager.findOne(Stock, {
        where: { product_id: productId },
        relations: ['product'],
      });
    });
  }

  async increaseQuantity(
    productId: string,
    amount: number,
    adjustmentType: string,
    reason?: string,
  ) {
    return this.adjustQuantity(productId, amount, adjustmentType, reason);
  }

  async decreaseQuantity(
    productId: string,
    amount: number,
    adjustmentType: string,
    reason?: string,
  ) {
    return this.adjustQuantity(productId, -amount, adjustmentType, reason);
  }

  async update(id: string, dto: UpdateStockDto) {
    const stock = await this.findOneByOrFail({ id });

    return this.repo.update(stock.id, dto);
  }
}
