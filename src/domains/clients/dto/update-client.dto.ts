import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

import { ClientStatus, clientStatus } from '../types';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @ApiProperty({
    example: 'active',
    description: 'Status of the client',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(clientStatus))
  status?: ClientStatus;

  @ApiProperty({
    example: 1700000000,
    description: 'Timestamp of the last contact with the client',
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
