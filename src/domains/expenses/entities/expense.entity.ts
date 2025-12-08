import { Column, Entity, OneToMany } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../common/base.entity';
import { ExpenseDto } from '../dto/expense.dto';
import { ExpenseCategory } from '../types';
import { ExpenseDocument } from './expense-upload.entity';

@Entity('expenses')
@SetDto(ExpenseDto)
export class Expense extends BaseEntity<ExpenseDto> {
  @Column({ type: 'varchar', length: 255 })
  category: ExpenseCategory;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  narration: string;

  @Column({ type: 'boolean', default: false })
  has_been_calculated: boolean;

  @Column({
    type: 'bigint',
    transformer: {
      to: (value: number) => Number(value),
      from: (value: number) => Number(value),
    },
  })
  reported_at: number;

  @OneToMany(
    () => ExpenseDocument,
    (expenseDocument) => expenseDocument.expense,
  )
  expense_documents?: ExpenseDocument[];
}
