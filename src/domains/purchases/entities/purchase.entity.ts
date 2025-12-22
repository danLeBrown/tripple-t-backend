import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';
import { Product } from '@/domains/shared/products/entities/product.entity';
import { Supplier } from '@/domains/suppliers/entities/supplier.entity';
import { Upload } from '@/domains/uploads/entities/upload.entity';

import { PurchaseDto } from '../dto/purchase.dto';

@Entity('purchases')
@SetDto(PurchaseDto)
export class Purchase extends BaseEntity<PurchaseDto> {
  @Column({ type: 'uuid' })
  upload_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'varchar', length: 255 })
  product_name: string;

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
