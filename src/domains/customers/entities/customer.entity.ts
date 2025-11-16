import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';

import { CustomerDto } from '../dto/customer.dto';
import { CustomerStatus } from '../types';

@Entity('customers')
export class Customer extends BaseEntity<CustomerDto> {
  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 100 })
  status: CustomerStatus;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;
}
