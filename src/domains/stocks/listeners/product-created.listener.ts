import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IProductCreatedEvent } from '@/domains/shared/products/events';

import { StocksService } from '../stocks.service';

@Injectable()
export class ProductCreatedListener {
  private readonly logger = new Logger(ProductCreatedListener.name);

  constructor(private stocksService: StocksService) {}

  @OnEvent('product.created', {
    async: true,
    promisify: true,
  })
  async createStockForProduct(event: IProductCreatedEvent) {
    const { product } = event;

    try {
      // Check if stock already exists (shouldn't happen, but safety check)
      const existingStock = await this.stocksService.findOneBy({
        product_id: product.id,
      });

      if (existingStock) {
        this.logger.warn(
          `Stock already exists for product ${product.id}, skipping creation`,
        );
        return; // Stock already exists
      }

      // Auto-create stock with 0 quantity
      await this.stocksService.create({
        product_id: product.id,
        quantity: 0,
        unit: product.unit,
      });

      this.logger.log(`Auto-created stock for product ${product.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to create stock for product ${product.id}: ${error.message}`,
        error.stack,
      );
      // Re-throw to let event emitter handle it
      throw error;
    }
  }
}
