import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';
import { ProductDto } from '@/domains/shared/products/dto/product.dto';
import { SupplierDto } from '@/domains/suppliers/dto/supplier.dto';
import { UploadDto } from '@/domains/uploads/dto/upload.dto';

import { Purchase } from '../entities/purchase.entity';

export class PurchaseDto extends BaseDto {
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
  product_name: string;

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

  constructor(purchase: Purchase) {
    super(purchase);
    this.upload_id = purchase.upload_id;
    this.product_id = purchase.product_id;
    this.product_name = purchase.product_name;
    this.supplier_id = purchase.supplier_id;
    this.supplier_name = purchase.supplier_name;
    this.quantity_in_bags = purchase.quantity_in_bags;
    this.price_per_bag = purchase.price_per_bag;
    this.total_price = purchase.total_price;
    this.purchased_at = purchase.purchased_at;

    if (purchase.upload) {
      this.upload = new UploadDto(purchase.upload);
    }

    if (purchase.supplier) {
      this.supplier = new SupplierDto(purchase.supplier);
    }

    if (purchase.product) {
      this.product = new ProductDto(purchase.product);
    }
  }
}
