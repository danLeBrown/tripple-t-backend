import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../common/dto/base.dto';
import { Customer } from '../entities/customer.entity';
import { CustomerStatus, customerStatus } from '../types';

export class CustomerDto extends BaseDto {
  @ApiProperty({
    example: 'Acme Inc.',
    description: 'The business name of the customer',
  })
  business_name: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the customer',
  })
  contact_person_first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the customer',
  })
  contact_person_last_name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email address of the customer',
  })
  contact_person_email: string | null;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the customer',
  })
  contact_person_phone_number: string;

  @ApiProperty({
    examples: Object.values(customerStatus),
    description: 'The status of the customer',
  })
  status: CustomerStatus;

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

    this.business_name = customer.business_name;
    this.contact_person_first_name = customer.contact_person_first_name;
    this.contact_person_last_name = customer.contact_person_last_name;
    this.contact_person_email = customer.contact_person_email;
    this.contact_person_phone_number = customer.contact_person_phone_number;
    this.status = customer.status;
    this.address = customer.address;
    this.state = customer.state;
  }
}
