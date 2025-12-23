import { Column, Entity } from 'typeorm';

import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../../common/base.entity';
import { SizeDto } from '../dto/size.dto';

@Entity({ name: 'sizes' })
@SetDto(SizeDto)
export class Size extends BaseEntity<SizeDto> {
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  value: number;
}
