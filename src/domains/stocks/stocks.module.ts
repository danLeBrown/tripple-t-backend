import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { Stock } from './entities/stock.entity';
import { StockHistory } from './entities/stock-history.entity';
import { ProductCreatedListener } from './listeners/product-created.listener';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stock, StockHistory]), SharedModule],
  controllers: [StocksController],
  providers: [StocksService, ProductCreatedListener],
  exports: [StocksService],
})
export class StocksModule {}
