import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { Document } from '@/domains/shared/documents/entities/document.entity';

import { ExpenseDocumentDto } from '../dto/expense-document.dto';
import { Expense } from './expense.entity';

@Entity('expense_documents')
export class ExpenseDocument extends BaseEntity<ExpenseDocumentDto> {
  @Column({ type: 'uuid' })
  expense_id: string;

  @Column({ type: 'uuid' })
  document_id: string;

  @OneToOne(() => Document, { eager: true })
  document?: Document;

  @ManyToOne(() => Expense, (expense) => expense.expense_documents)
  expense?: Expense;
}
