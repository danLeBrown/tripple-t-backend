import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

import { CreateUploadDto } from '@/domains/uploads/dto/create-upload.dto';

import { CreatePurchaseRecordWithoutUploadAndSupplierDto } from './create-purchase-record.dto';

export class CreateSupplierPurchaseRecordDto {
  @ApiProperty({
    description: 'Upload details',
    type: CreateUploadDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUploadDto)
  upload: CreateUploadDto;

  @ApiProperty({
    description: 'Purchase records details for the supplier',
    type: [CreatePurchaseRecordWithoutUploadAndSupplierDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseRecordWithoutUploadAndSupplierDto)
  purchase_records: CreatePurchaseRecordWithoutUploadAndSupplierDto[];
}
