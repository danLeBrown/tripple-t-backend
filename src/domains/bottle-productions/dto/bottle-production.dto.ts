import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../common/dto/base.dto';
import { CustomerDto } from '@/domains/customers/dto/customer.dto';
import { ProductDto } from '@/domains/shared/products/dto/product.dto';
import { SupplierDto } from '@/domains/suppliers/dto/supplier.dto';
import { BottleProduction } from '../entities/bottle-production.entity';

export class BottleProductionDto extends BaseDto {
  @ApiProperty({
    description: 'ID of the customer (for third-party production)',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    nullable: true,
  })
  customer_id: string | null;

  @ApiProperty({
    description: 'ID of the supplier (preform supplier)',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    nullable: true,
  })
  supplier_id: string | null;

  @ApiProperty({
    description: 'Name of the supplier (preform supplier)',
    example: 'ABC Preforms Ltd',
  })
  supplier_name: string;

  @ApiProperty({
    description: 'ID of the product (preform product)',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    nullable: true,
  })
  product_id: string | null;

  @ApiProperty({
    description: 'Name of the preform',
    example: '500ml Clear Preform',
  })
  preform_name: string;

  @ApiProperty({
    description: 'Size of the preform',
    example: 18.5,
  })
  preform_size: number;

  @ApiProperty({
    description: 'Color of the preform',
    example: 'Clear',
  })
  preform_color: string;

  @ApiProperty({
    description: 'Number of preforms used',
    example: 1000,
  })
  preforms_used: number;

  @ApiProperty({
    description: 'Number of defective preforms',
    example: 50,
  })
  preforms_defective: number;

  @ApiProperty({
    description: 'Number of successful preforms (computed)',
    example: 950,
  })
  preforms_successful: number;

  @ApiProperty({
    description: 'Size of the produced bottle',
    example: 18.5,
  })
  bottle_size: number;

  @ApiProperty({
    description: 'Color of the produced bottle',
    example: 'Clear',
  })
  bottle_color: string;

  @ApiProperty({
    description: 'Number of bottles produced',
    example: 950,
  })
  bottles_produced: number;

  @ApiProperty({
    description: 'Number of defective bottles',
    example: 25,
  })
  bottles_defective: number;

  @ApiProperty({
    description: 'Number of successful bottles (computed)',
    example: 925,
  })
  bottles_successful: number;

  @ApiProperty({
    description: 'Unix timestamp when production occurred',
    example: 1700000000,
  })
  produced_at: number;

  @ApiProperty({
    description: 'Additional notes about the production',
    example: 'Production run completed successfully',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description: 'The associated customer',
    type: () => CustomerDto,
    nullable: true,
  })
  customer?: CustomerDto | null;

  @ApiProperty({
    description: 'The associated supplier',
    type: () => SupplierDto,
    nullable: true,
  })
  supplier?: SupplierDto | null;

  @ApiProperty({
    description: 'The associated product',
    type: () => ProductDto,
    nullable: true,
  })
  product?: ProductDto | null;

  constructor(production: BottleProduction) {
    super(production);

    this.customer_id = production.customer_id;
    this.supplier_id = production.supplier_id;
    this.supplier_name = production.supplier_name;
    this.product_id = production.product_id;
    this.preform_name = production.preform_name;
    this.preform_size = production.preform_size;
    this.preform_color = production.preform_color;
    this.preforms_used = production.preforms_used;
    this.preforms_defective = production.preforms_defective;
    this.preforms_successful = production.preforms_used - production.preforms_defective;
    this.bottle_size = production.bottle_size;
    this.bottle_color = production.bottle_color;
    this.bottles_produced = production.bottles_produced;
    this.bottles_defective = production.bottles_defective;
    this.bottles_successful = production.bottles_produced - production.bottles_defective;
    this.produced_at = production.produced_at;
    this.notes = production.notes;

    if (production.customer) {
      this.customer = production.customer.toDto();
    }

    if (production.supplier) {
      this.supplier = production.supplier.toDto();
    }

    if (production.product) {
      this.product = production.product.toDto();
    }
  }

  static collection(productions: BottleProduction[]): BottleProductionDto[] {
    return productions.map((production) => new BottleProductionDto(production));
  }
}

