import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateStockDto {
  @ApiProperty({
    description: 'ID of the associated product',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    description: 'Initial quantity in stock',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @IsPositive()
  quantity?: number;

  @ApiProperty({
    description:
      'Unit of measurement (will be set from product.unit if not provided)',
    example: 'bag',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;
}
