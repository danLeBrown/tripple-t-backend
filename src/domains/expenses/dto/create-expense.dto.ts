import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    example: 1500,
    description: 'The amount of the expense',
  })
  @IsNumber({ maxDecimalPlaces: 0, allowInfinity: false })
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'Office supplies purchase',
    description: 'The narration or description of the expense',
  })
  @IsString()
  @IsNotEmpty()
  narration: string;

  @ApiProperty({
    example: false,
    description: 'Indicates if the expense has been calculated',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  has_been_calculated: boolean;

  // expense_document_ids?: string[];
}
