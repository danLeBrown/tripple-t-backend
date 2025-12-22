import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

import { CreateUploadDto } from '@/domains/uploads/dto/create-upload.dto';

import { CreatePurchaseWithoutPurchaseInvoiceAndSupplierDto } from './create-purchase.dto';

export class CreatePurchaseWithInvoiceDto {
  @ApiProperty({
    description: 'Upload details',
    type: CreateUploadDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUploadDto)
  upload: CreateUploadDto;

  @ApiProperty({
    description: 'Purchases details',
    type: [CreatePurchaseWithoutPurchaseInvoiceAndSupplierDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseWithoutPurchaseInvoiceAndSupplierDto)
  purchases: CreatePurchaseWithoutPurchaseInvoiceAndSupplierDto[];
}
