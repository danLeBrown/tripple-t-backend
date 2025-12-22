import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuppliersModule } from '../suppliers/suppliers.module';
import { PurchaseRecord } from './entities/purchase-record.entity';
import { PurchaseRecordsController } from './purchase-records.controller';
import { PurchaseRecordsService } from './purchase-records.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseRecord]), SuppliersModule],
  controllers: [PurchaseRecordsController],
  providers: [PurchaseRecordsService],
  exports: [PurchaseRecordsService, TypeOrmModule],
})
export class PurchaseRecordsModule {}
