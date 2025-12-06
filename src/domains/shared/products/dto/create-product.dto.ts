import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsPositive, IsString } from 'class-validator';

import { ProductType, productType } from '../types';

export class CreateProductDto {
  @ApiProperty({
    description: 'Type of the product',
    example: 'Bottle',
  })
  @IsIn(Object.values(productType))
  type: ProductType;

  @ApiProperty({
    description: 'Size of the product',
    example: 500,
  })
  @IsNumber()
  @IsPositive()
  size: number;

  @ApiProperty({
    description: 'Colour of the product',
    example: 'Red',
  })
  @IsString()
  colour: string;

  @ApiProperty({
    description: 'Unit of the product',
    example: 'Liter',
  })
  @IsString()
  unit: string;
}
