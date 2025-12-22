import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePurchaseInvoiceDto {
  @ApiProperty({
    description: 'ID of the associated supplier',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  supplier_id: string;

  @ApiProperty({
    description: 'ID of the associated document',
    example: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4',
  })
  @IsUUID()
  document_id: string;
}

export class CreatePurchaseInvoiceWithoutDocumentDto extends OmitType(
  CreatePurchaseInvoiceDto,
  ['document_id'],
) {}
