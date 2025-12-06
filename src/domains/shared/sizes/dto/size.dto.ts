import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../../common/dto/base.dto';
import { Size } from '../entities/size.entity';

export class SizeDto extends BaseDto {
  @ApiProperty({
    description: 'Value of the size',
    example: 42,
  })
  value: number;

  constructor(size: Size) {
    super(size);

    this.value = size.value;
  }
}
