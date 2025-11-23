import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';
import { DocumentDto } from '@/domains/shared/documents/dto/document.dto';

import { ExpenseDocument } from '../entities/expense-upload.entity';

export class ExpenseDocumentDto extends BaseDto {
  @ApiProperty({
    description: 'ID of the associated expense',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  expense_id: string;
  @ApiProperty({
    description: 'ID of the associated document',
    example: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4',
  })
  document_id: string;
  @ApiProperty({
    description: 'The associated document details',
    type: () => DocumentDto,
  })
  document?: DocumentDto;

  constructor(expenseDocument: ExpenseDocument) {
    super(expenseDocument);

    this.expense_id = expenseDocument.expense_id;
    this.document_id = expenseDocument.document_id;

    if (expenseDocument.document) {
      this.document = new DocumentDto(expenseDocument.document);
    }
  }
}
