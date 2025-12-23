import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { SetDto } from '@/decorators/set-dto.decorator';
import { Product } from '@/domains/shared/products/entities/product.entity';
import { Supplier } from '@/domains/suppliers/entities/supplier.entity';

import { BaseEntity } from '../../../common/base.entity';
import { BottleProductionDto } from '../dto/bottle-production.dto';

@Entity({ name: 'bottle_productions' })
@SetDto(BottleProductionDto)
export class BottleProduction extends BaseEntity<BottleProductionDto> {
  @Column({ type: 'uuid' })
  preform_supplier_id: string;

  @Column({ type: 'varchar', length: 255 })
  supplier_name: string;

  @Column({ type: 'uuid' })
  preform_product_id: string;

  @Column({ type: 'varchar', length: 255 })
  preform_name: string;

  @Column({ type: 'uuid' })
  bottle_product_id: string;

  @Column({ type: 'varchar', length: 255 })
  bottle_name: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  preform_size: number;

  @Column({ type: 'varchar', length: 255 })
  preform_color: string;

  @Column({ type: 'int' })
  preforms_used: number;

  @Column({ type: 'int' })
  preforms_defective: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  bottle_size: number;

  @Column({ type: 'varchar', length: 255 })
  bottle_color: string;

  @Column({ type: 'int' })
  bottles_produced: number;

  @Column({ type: 'int' })
  bottles_defective: number;

  @Column({ type: 'bigint' })
  produced_at: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'bigint', nullable: true })
  deleted_at: number | null;

  @ManyToOne(() => Supplier, { eager: true })
  @JoinColumn({ name: 'preform_supplier_id', referencedColumnName: 'id' })
  supplier?: Supplier;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'preform_product_id', referencedColumnName: 'id' })
  preform_product?: Product;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'bottle_product_id', referencedColumnName: 'id' })
  bottle_product?: Product;
}
