import { ApiProperty } from '@nestjs/swagger';

import { ProductDto } from '@/domains/shared/products/dto/product.dto';
import { ProductType } from '@/domains/shared/products/types';
import { SupplierDto } from '@/domains/suppliers/dto/supplier.dto';
import { UploadDto } from '@/domains/uploads/dto/upload.dto';

import { BaseDto } from '../../../common/dto/base.dto';
import { PurchaseRecord } from '../entities/purchase-record.entity';

export class PurchaseRecordDto extends BaseDto {
  @ApiProperty({
    description: 'ID of the associated upload',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  upload_id: string;

  @ApiProperty({
    description: 'ID of the associated product',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  product_id: string;

  @ApiProperty({
    description: 'Name of the associated product',
    example: 'John Doe',
  })
  product_name: string;

  @ApiProperty({
    description: 'Type of the associated product',
    example: 'Bottle',
  })
  product_type: ProductType;

  @ApiProperty({
    description: 'ID of the associated supplier',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  supplier_id: string;

  @ApiProperty({
    description: 'Name of the associated supplier',
    example: 'John Doe',
  })
  supplier_name: string;

  @ApiProperty({
    description: 'Quantity of the product in bags',
    example: 10,
  })
  quantity_in_bags: number;

  @ApiProperty({
    description: 'Price per bag',
    example: 100,
  })
  price_per_bag: number;

  @ApiProperty({
    description: 'Total price of the purchase',
    example: 1000,
  })
  total_price: number;

  @ApiProperty({
    description: 'Purchased at',
    example: 1700000000,
  })
  purchased_at: number;

  @ApiProperty({
    description: 'The associated upload',
    type: () => UploadDto,
  })
  upload: UploadDto;

  @ApiProperty({
    description: 'The associated supplier',
    type: () => SupplierDto,
  })
  supplier: SupplierDto;

  @ApiProperty({
    description: 'The associated product',
    type: () => ProductDto,
  })
  product: ProductDto;

  constructor(purchaseRecord: PurchaseRecord) {
    super(purchaseRecord);
    this.upload_id = purchaseRecord.upload_id;
    this.product_id = purchaseRecord.product_id;
    this.product_name = purchaseRecord.product_name;
    this.product_type = purchaseRecord.product_type;
    this.supplier_id = purchaseRecord.supplier_id;
    this.supplier_name = purchaseRecord.supplier_name;
    this.quantity_in_bags = purchaseRecord.quantity_in_bags;
    this.price_per_bag = purchaseRecord.price_per_bag;
    this.total_price = purchaseRecord.total_price;
    this.purchased_at = purchaseRecord.purchased_at;

    if (purchaseRecord.upload) {
      this.upload = new UploadDto(purchaseRecord.upload);
    }

    if (purchaseRecord.supplier) {
      this.supplier = new SupplierDto(purchaseRecord.supplier);
    }

    if (purchaseRecord.product) {
      this.product = new ProductDto(purchaseRecord.product);
    }
  }
}
