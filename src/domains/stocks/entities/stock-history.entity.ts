import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../common/base.entity';
import { BaseDto } from '../../../common/dto/base.dto';
import { Stock } from './stock.entity';

@Entity({ name: 'stock_history' })
@SetDto(BaseDto)
export class StockHistory extends BaseEntity<BaseDto> {
  @Column({ type: 'uuid' })
  stock_id: string;

  @Column({ type: 'varchar', length: 255 })
  adjustment_type: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  quantity_delta: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  quantity_before: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  quantity_after: number;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'stock_id', referencedColumnName: 'id' })
  stock?: Stock;
}
