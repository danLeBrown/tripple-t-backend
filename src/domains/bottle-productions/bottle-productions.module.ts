import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomersModule } from '../customers/customers.module';
import { SharedModule } from '../shared/shared.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { BottleProduction } from './entities/bottle-production.entity';
import { BottleProductionsController } from './bottle-productions.controller';
import { BottleProductionsService } from './bottle-productions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BottleProduction]),
    CustomersModule,
    SuppliersModule,
    SharedModule,
  ],
  controllers: [BottleProductionsController],
  providers: [BottleProductionsService],
  exports: [BottleProductionsService, TypeOrmModule],
})
export class BottleProductionsModule {}

