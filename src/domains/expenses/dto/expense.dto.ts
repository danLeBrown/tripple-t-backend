import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../common/dto/base.dto';
import { Expense } from '../entities/expense.entity';
import { ExpenseCategory } from '../types';

export class ExpenseDto extends BaseDto {
  @ApiProperty({
    description: 'Category of the expense',
    example: 'Utility',
  })
  category: ExpenseCategory;

  @ApiProperty({
    description: 'Amount of the expense',
    example: 1500,
  })
  amount: number;

  @ApiProperty({
    description: 'Narration or description of the expense',
    example: 'Office supplies purchase',
  })
  narration: string;

  @ApiProperty({
    description: 'Date the expense was reported',
    example: 1717987200,
  })
  reported_at: number;

  constructor(expense: Expense) {
    super(expense);

    this.category = expense.category;
    this.amount = expense.amount;
    this.narration = expense.narration;
    this.reported_at = expense.reported_at;
  }
}
