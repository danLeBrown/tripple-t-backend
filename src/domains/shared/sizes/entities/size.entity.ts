import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';

import { SizeDto } from '../dto/size.dto';

@Entity({ name: 'sizes' })
export class Size extends BaseEntity<SizeDto> {
  @Column({ type: 'int' })
  value: number;
}
