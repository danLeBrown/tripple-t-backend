import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../common/dto/base.dto';
import { Supplier } from '../entities/supplier.entity';
import { SupplierStatus, supplierStatus } from '../types';

export class SupplierDto extends BaseDto {
  @ApiProperty({
    example: 'Acme Inc.',
    description: 'The business name of the supplier',
  })
  business_name: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the contact person for the supplier',
  })
  contact_person_first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the contact person for the supplier',
  })
  contact_person_last_name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email address of the contact person for the supplier',
  })
  contact_person_email: string | null;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the contact person for the supplier',
  })
  contact_person_phone_number: string;

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

    this.business_name = supplier.business_name;
    this.contact_person_first_name = supplier.contact_person_first_name;
    this.contact_person_last_name = supplier.contact_person_last_name;
    this.contact_person_email = supplier.contact_person_email;
    this.contact_person_phone_number = supplier.contact_person_phone_number;
    this.status = supplier.status;
    this.address = supplier.address;
    this.state = supplier.state;
  }
}
