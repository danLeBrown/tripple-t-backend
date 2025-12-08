import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

import { EXPENSE_CATEGORIES, ExpenseCategory } from '../types';

export class CreateExpenseDto {
  @ApiProperty({
    example: 'Utility',
    description: 'The category of the expense',
  })
  @IsIn(Object.values(EXPENSE_CATEGORIES))
  category: ExpenseCategory;

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
  has_been_calculated?: boolean;

  @ApiProperty({
    example: 1717987200,
    description: 'Date the expense was reported',
  })
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @IsInt()
  reported_at: number;

  // expense_document_ids?: string[];
}
