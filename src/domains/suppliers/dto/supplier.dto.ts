import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { Supplier } from '../entities/supplier.entity';
import { SupplierStatus, supplierStatus } from '../types';

export class SupplierDto extends BaseDto {
  @ApiProperty({
    example: 'John',
    description: 'The first name of the supplier',
  })
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the supplier',
  })
  last_name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email address of the supplier',
  })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the supplier',
  })
  phone_number: string;

  @ApiProperty({
    examples: Object.values(supplierStatus),
    description: 'The status of the supplier',
  })
  status: SupplierStatus;

  @ApiProperty({
    example: '123 Main St, Anytown, USA',
    description: 'The address of the supplier',
  })
  address: string;

  @ApiProperty({
    example: 'California',
    description: 'The state of the supplier',
  })
  state: string;

  constructor(supplier: Supplier) {
    super(supplier);

    this.first_name = supplier.first_name;
    this.last_name = supplier.last_name;
    this.email = supplier.email;
    this.phone_number = supplier.phone_number;
    this.status = supplier.status;
    this.address = supplier.address;
    this.state = supplier.state;
  }
}
