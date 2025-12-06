import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';

import { UnitDto } from '../dto/unit.dto';

@Entity({ name: 'units' })
export class Unit extends BaseEntity<UnitDto> {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  symbol: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  slug: string;
}
