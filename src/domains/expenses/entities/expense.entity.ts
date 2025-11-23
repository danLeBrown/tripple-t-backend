import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';

import { ExpenseDto } from '../dto/expense.dto';
import { ExpenseDocument } from './expense-upload.entity';

@Entity('expenses')
export class Expense extends BaseEntity<ExpenseDto> {
  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 100 })
  narration: string;

  @Column({ type: 'boolean', default: false })
  has_been_calculated: boolean;

  @OneToMany(
    () => ExpenseDocument,
    (expenseDocument) => expenseDocument.expense,
  )
  expense_documents: ExpenseDocument[];
}
