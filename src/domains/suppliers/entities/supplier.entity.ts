import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';

import { SupplierDto } from '../dto/supplier.dto';
import { SupplierStatus } from '../types';

@Entity('suppliers')
export class Supplier extends BaseEntity<SupplierDto> {
  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 100 })
  status: SupplierStatus;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;
}
