import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { CreateUploadDto } from '@/domains/uploads/dto/create-upload.dto';

import { CreatePurchaseRecordWithoutUploadAndSupplierDto } from './create-purchase-record.dto';

export class CreateSupplierPurchaseRecordDto {
  @ApiProperty({
    description: 'Upload details',
    type: CreateUploadDto,
    required: false,
  })
  @ValidateIf((object, value) => !value?.upload_id)
  @ValidateNested()
  @Type(() => CreateUploadDto)
  upload?: CreateUploadDto;

  @ApiProperty({
    description: 'ID of the associated upload',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    required: false,
  })
  @ValidateIf((object, value) => !value?.upload)
  @IsUUID()
  upload_id?: string;

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
