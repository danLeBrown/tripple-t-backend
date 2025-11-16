// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { CreateLeadDto } from './create-lead.dto';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiProperty({
    example: 1700000000,
    description: 'Timestamp of the last contact with the lead',
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  last_contacted_at?: number;

  @ApiProperty({
    example: 1700000000,
    description: 'Timestamp of the next follow up date with the lead',
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  next_follow_up_at?: number;
}
