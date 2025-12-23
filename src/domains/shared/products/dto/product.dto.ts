import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../../common/dto/base.dto';
import { Product } from '../entities/product.entity';
import { ProductType } from '../types';

export class ProductDto extends BaseDto {
  @ApiProperty({
    description: 'Type of the product',
    example: 'Bottle',
  })
  type: ProductType;

  @ApiProperty({
    description: 'Size of the product',
    example: 18.5,
  })
  size: number;

  @ApiProperty({
    description: 'Colour of the product',
    example: 'Red',
  })
  colour: string;

  @ApiProperty({
    description: 'Unit of the product',
    example: 'Liter',
  })
  unit: string;

  @ApiProperty({
    description: 'Slug of the product',
    example: '100_ml_red',
  })
  slug: string;

  @ApiProperty({
    description: 'Name of the product',
    example: '100 ml Red',
  })
  name: string;

  constructor(product: Product) {
    super(product);

    this.type = product.type;
    this.size = product.size;
    this.colour = product.colour;
    this.unit = product.unit;
    this.slug = product.slug;

    this.name = product.name;
  }
}
