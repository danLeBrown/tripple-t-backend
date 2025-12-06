import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../../common/dto/base.dto';

import { Unit } from '../entities/unit.entity';

export class UnitDto extends BaseDto {
  @ApiProperty({
    description: 'Name of the unit',
    example: 'Kilogram',
  })
  name: string;

  @ApiProperty({
    description: 'Symbol of the unit',
    example: 'kg',
  })
  symbol: string;

  @ApiProperty({
    description: 'Slug of the unit',
    example: 'kilogram',
  })
  slug: string;

  constructor(unit: Unit) {
    super(unit);

    this.name = unit.name;
    this.symbol = unit.symbol;
    this.slug = unit.slug;
  }
}
