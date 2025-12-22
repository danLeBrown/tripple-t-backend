import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';
import { Product } from '@/domains/shared/products/entities/product.entity';
import { ProductType } from '@/domains/shared/products/types';
import { Supplier } from '@/domains/suppliers/entities/supplier.entity';
import { Upload } from '@/domains/uploads/entities/upload.entity';

import { BaseEntity } from '../../../common/base.entity';
import { PurchaseRecordDto } from '../dto/purchase-record.dto';

@Entity('purchase_records')
@SetDto(PurchaseRecordDto)
export class PurchaseRecord extends BaseEntity<PurchaseRecordDto> {
  @Column({ type: 'uuid' })
  upload_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'varchar', length: 255 })
  product_name: string;

  @Column({ type: 'varchar', length: 255 })
  product_type: ProductType;

  @Column({ type: 'uuid' })
  supplier_id: string;

  @Column({ type: 'varchar', length: 255 })
  supplier_name: string;

  @Column({ type: 'int' })
  quantity_in_bags: number;

  @Column({ type: 'int' })
  price_per_bag: number;

  @Column({ type: 'int' })
  total_price: number;

  @Column({ type: 'bigint' })
  purchased_at: number;

  @Column({ type: 'boolean', default: false })
  has_been_calculated: boolean;

  @OneToOne(() => Upload, { eager: true })
  @JoinColumn({ name: 'upload_id', referencedColumnName: 'id' })
  upload?: Upload;

  @ManyToOne(() => Supplier, { eager: true })
  @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
  supplier?: Supplier;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product?: Product;
}
