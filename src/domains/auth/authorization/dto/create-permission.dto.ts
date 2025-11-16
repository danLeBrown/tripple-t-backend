import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

import {
  PermissionAction,
  permissionAction,
  PermissionSubject,
  permissionSubject,
} from '../types';

export class CreatePermissionDto {
  @ApiProperty({
    type: String,
    description: 'The subject of the permission',
    example: 'User',
  })
  @IsString()
  @IsIn(Object.values(permissionSubject))
  subject: PermissionSubject;

  @ApiProperty({
    type: String,
    description: 'The action associated with the permission',
    example: 'create',
  })
  @IsString()
  @IsIn(Object.values(permissionAction))
  action: PermissionAction;

  @ApiProperty({
    type: String,
    description: 'A description for the permission',
    example: 'This permission allows creating users.',
  })
  @IsString()
  description: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
