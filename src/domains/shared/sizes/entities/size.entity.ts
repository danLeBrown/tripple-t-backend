import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../../common/base.entity';

import { SizeDto } from '../dto/size.dto';
import { SetDto } from '@/decorators/set-dto.decorator';

@Entity({ name: 'sizes' })
@SetDto(SizeDto)
export class Size extends BaseEntity<SizeDto> {
  @Column({ type: 'int' })
  value: number;
}
