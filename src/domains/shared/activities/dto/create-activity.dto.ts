/* eslint-disable max-classes-per-file */
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidationArguments,
} from 'class-validator';

import { User } from '@/domains/auth/users/entities/user.entity';
import { EntityExists } from '@/validators/entity-exists';

export class CreateActivityDto {
  @ApiProperty({
    description: 'The admin user ID associated with the activity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @EntityExists([
    User,
    (args: ValidationArguments) => ({ id: args.object[args.property] }),
  ])
  admin_user_id: string;

  @ApiProperty({
    example: 'leads',
    description:
      'The type of resource this tag is associated with, e.g., "leads", "clients", etc.',
  })
  @IsString()
  @IsNotEmpty()
  resource_name: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'The unique identifier of the resource this tag is associated with.',
  })
  @IsUUID()
  resource_id: string;

  @ApiProperty({
    description: 'The type of activity, e.g., "call", "email", "meeting"',
    example: 'call',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'The description of the activity',
    example: 'Called the client to discuss project updates',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateActivityDto extends PickType(CreateActivityDto, [
  'type',
  'description',
]) {}

export class CreateActivityWithoutResourceDto extends OmitType(
  CreateActivityDto,
  ['resource_id', 'resource_name'] as const,
) {}
