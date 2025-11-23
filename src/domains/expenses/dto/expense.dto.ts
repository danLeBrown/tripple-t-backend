import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { Expense } from '../entities/expense.entity';
import { ExpenseDocumentDto } from './expense-document.dto';

export class ExpenseDto extends BaseDto {
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
    description: 'Documents associated with the expense',
    type: () => [ExpenseDocumentDto],
  })
  expense_document: ExpenseDocumentDto[];

  constructor(expense: Expense) {
    super(expense);

    this.amount = expense.amount;
    this.narration = expense.narration;
  }
}
