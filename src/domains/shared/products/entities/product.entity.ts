import { Column, Entity } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../../common/base.entity';
import { ProductDto } from '../dto/product.dto';
import { ProductType } from '../types';

@Entity({ name: 'product' })
@SetDto(ProductDto)
export class Product extends BaseEntity<ProductDto> {
  @Column({ type: 'varchar', length: 255 })
  type: ProductType;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'varchar', length: 255 })
  colour: string;

  @Column({ type: 'varchar', length: 255 })
  unit: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  slug: string;
}
