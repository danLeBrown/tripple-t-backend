import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';

import { CustomerDto } from '../dto/customer.dto';

@Entity('customers')
export class Customer extends BaseEntity<CustomerDto> {
  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  status: string;
}
