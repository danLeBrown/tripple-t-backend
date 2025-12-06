import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';

import { ColourDto } from '../dto/colour.dto';

@Entity({ name: 'colours' })
export class Colour extends BaseEntity<ColourDto> {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  slug: string;
}
