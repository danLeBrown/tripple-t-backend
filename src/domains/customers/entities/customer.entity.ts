import { Column, Entity } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../common/base.entity';
import { CustomerDto } from '../dto/customer.dto';
import { CustomerStatus } from '../types';

@Entity('customers')
@SetDto(CustomerDto)
export class Customer extends BaseEntity<CustomerDto> {
  @Column({ type: 'varchar', length: 100 })
  business_name: string;

  @Column({ type: 'varchar', length: 100 })
  contact_person_first_name: string;

  @Column({ type: 'varchar', length: 100 })
  contact_person_last_name: string;

  @Column({ type: 'varchar', length: 255 })
  contact_person_email: string | null;

  @Column({ type: 'varchar', length: 100 })
  contact_person_phone_number: string;

  @Column({ type: 'varchar', length: 100 })
  status: CustomerStatus;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;
}
