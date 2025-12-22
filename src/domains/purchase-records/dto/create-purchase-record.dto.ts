import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreatePurchaseRecordDto {
  @ApiProperty({
    description: 'ID of the associated upload',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  upload_id: string;

  @ApiProperty({
    description: 'ID of the associated product',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    description: 'ID of the associated supplier',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  supplier_id: string;

  @ApiProperty({
    description: 'Quantity of the product in bags',
    example: 10,
  })
  @IsNumber()
  @IsPositive()
  quantity_in_bags: number;

  @ApiProperty({
    description: 'Price per bag',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  price_per_bag: number;

  @ApiProperty({
    description: 'Purchased at',
    example: 1700000000,
  })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsPositive()
  purchased_at: number;
}

export class CreatePurchaseRecordWithoutUploadAndSupplierDto extends OmitType(
  CreatePurchaseRecordDto,
  ['upload_id', 'supplier_id'] as const,
) {}
