import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({
    description:
      'Change in quantity (positive for increase, negative for decrease)',
    example: 10,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @IsNotEmpty()
  quantity_delta: number;

  @ApiProperty({
    description: 'Type of adjustment',
    example: 'manual',
    enum: ['increase', 'decrease', 'manual', 'purchase', 'production'],
  })
  @IsString()
  @IsNotEmpty()
  adjustment_type: string;

  @ApiProperty({
    description: 'Reason for the adjustment',
    example: 'Manual stock correction',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
