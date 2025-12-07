import { Column, Entity } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../common/base.entity';
import { SupplierDto } from '../dto/supplier.dto';
import { SupplierStatus } from '../types';

@Entity('suppliers')
@SetDto(SupplierDto)
export class Supplier extends BaseEntity<SupplierDto> {
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
  status: SupplierStatus;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;
}
