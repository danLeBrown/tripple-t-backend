import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../../common/dto/base.dto';
import { Colour } from '../entities/colour.entity';

export class ColourDto extends BaseDto {
  @ApiProperty({
    description: 'Name of the colour',
    example: 'Red',
  })
  name: string;

  @ApiProperty({
    description: 'Slug of the colour',
    example: 'red',
  })
  slug: string;

  constructor(colour: Colour) {
    super(colour);

    this.name = colour.name;
    this.slug = colour.slug;
  }
}
