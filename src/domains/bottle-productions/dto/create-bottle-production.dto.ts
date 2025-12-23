import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  ValidateIf,
} from 'class-validator';

export class CreateBottleProductionDto {
  @ApiProperty({
    description: 'ID of the preform supplier',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  preform_supplier_id: string;

  @ApiProperty({
    description: 'ID of the preform product',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  preform_product_id: string;

  @ApiProperty({
    description: 'ID of the bottle product',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  bottle_product_id: string;

  @ApiProperty({
    description: 'Size of the preform',
    example: 18.5,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  preform_size: number;

  @ApiProperty({
    description: 'Number of preforms used',
    example: 1000,
  })
  @IsInt()
  @IsPositive()
  preforms_used: number;

  @ApiProperty({
    description: 'Number of defective preforms',
    example: 50,
  })
  @IsInt()
  @IsPositive()
  @Max(1000000, { message: 'Defective preforms cannot exceed 1,000,000' })
  preforms_defective: number;

  @ApiProperty({
    description: 'Size of the produced bottle',
    example: 18.5,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  bottle_size: number;

  @ApiProperty({
    description:
      'Color of the produced bottle (defaults to preform color if not provided)',
    example: 'Clear',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bottle_color?: string;

  @ApiProperty({
    description: 'Number of bottles produced',
    example: 950,
  })
  @IsInt()
  @IsPositive()
  bottles_produced: number;

  @ApiProperty({
    description: 'Number of defective bottles',
    example: 25,
  })
  @IsInt()
  @IsPositive()
  @Max(1000000, { message: 'Defective bottles cannot exceed 1,000,000' })
  bottles_defective: number;

  @ApiProperty({
    description: 'Unix timestamp when production occurred',
    example: 1700000000,
  })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsPositive()
  produced_at: number;

  @ApiProperty({
    description: 'Additional notes about the production',
    example: 'Production run completed successfully',
    required: false,
  })
  @ValidateIf((o) => o.bottles_produced === 0, {
    message: 'Notes are required when bottles produced is 0',
  })
  @IsString()
  @IsNotEmpty()
  notes?: string | null;
}
