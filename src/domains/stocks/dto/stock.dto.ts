import { ApiProperty } from '@nestjs/swagger';

import { ProductDto } from '@/domains/shared/products/dto/product.dto';

import { BaseDto } from '../../../common/dto/base.dto';
import { Stock } from '../entities/stock.entity';

export class StockDto extends BaseDto {
  @ApiProperty({
    description: 'ID of the associated product',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  product_id: string;

  @ApiProperty({
    description: 'Current quantity in stock',
    example: 100.5,
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'bag',
  })
  unit: string;

  @ApiProperty({
    description: 'The associated product',
    type: () => ProductDto,
  })
  product: ProductDto;

  constructor(stock: Stock) {
    super(stock);

    this.product_id = stock.product_id;
    this.quantity = stock.quantity;
    this.unit = stock.unit;

    if (stock.product) {
      this.product = new ProductDto(stock.product);
    }
  }
}
