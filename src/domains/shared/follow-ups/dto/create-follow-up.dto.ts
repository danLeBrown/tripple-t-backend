import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsIn, IsNumber, IsString, IsUUID } from 'class-validator';

import { ResourceName, resourceName } from '../types';

export class CreateFollowUpDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the admin',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the resource',
  })
  @IsUUID()
  resource_id: string;

  @ApiProperty({
    example: 'leads',
    description: 'The name of the resource',
  })
  @IsString()
  @IsIn(Object.values(resourceName))
  resource_name: ResourceName;

  @ApiProperty({
    example: 1716835200,
    description: 'The timestamp of the next follow-up',
  })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  follow_up_at: number;
}

export class CreateFollowUpDtoOmitResource extends OmitType(CreateFollowUpDto, [
  'resource_id',
  'resource_name',
] as const) {}
