import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { Customer } from '../entities/customer.entity';

export class CustomerDto extends BaseDto {
  @ApiProperty({
    example: 'John',
    description: 'The first name of the customer',
  })
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the customer',
  })
  last_name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email address of the customer',
  })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the customer',
  })
  phone_number: string;

  @ApiProperty({
    example: '123 Main St, Anytown, USA',
    description: 'The address of the customer',
  })
  address: string;

  @ApiProperty({
    example: 'California',
    description: 'The state of the customer',
  })
  state: string;

  constructor(customer: Customer) {
    super(customer);

    this.first_name = customer.first_name;
    this.last_name = customer.last_name;
    this.email = customer.email;
    this.phone_number = customer.phone_number;
    this.address = customer.address;
  }
}
