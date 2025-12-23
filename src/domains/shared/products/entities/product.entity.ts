import { Column, Entity } from 'typeorm';

import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../../common/base.entity';
import { ProductDto } from '../dto/product.dto';
import { ProductType } from '../types';

@Entity({ name: 'products' })
@SetDto(ProductDto)
export class Product extends BaseEntity<ProductDto> {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  type: ProductType;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  size: number;

  @Column({ type: 'varchar', length: 255 })
  colour: string;

  @Column({ type: 'varchar', length: 255 })
  unit: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  slug: string;
}
