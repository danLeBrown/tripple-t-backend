import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../../common/base.entity';

import { ColourDto } from '../dto/colour.dto';
import { SetDto } from '@/decorators/set-dto.decorator';

@Entity({ name: 'colours' })
@SetDto(ColourDto)
export class Colour extends BaseEntity<ColourDto> {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  slug: string;
}
