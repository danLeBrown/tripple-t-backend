import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { SetDto } from '@/decorators/set-dto.decorator';
import { Product } from '@/domains/shared/products/entities/product.entity';

import { BaseEntity } from '../../../common/base.entity';
import { StockDto } from '../dto/stock.dto';

@Entity({ name: 'stocks' })
@SetDto(StockDto)
export class Stock extends BaseEntity<StockDto> {
  @Column({ type: 'uuid' })
  product_id: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
    default: 0,
  })
  quantity: number;

  @Column({ type: 'varchar', length: 255 })
  unit: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product?: Product;
}
