import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { Permission } from '../entities/permission.entity';
import { PermissionAction, PermissionSubject } from '../types';

export class PermissionDto extends BaseDto {
  @ApiProperty({
    type: String,
    description: 'The name of the permission',
    example: 'User',
  })
  subject: PermissionSubject;

  @ApiProperty({
    type: String,
    description: 'The unique slug of the permission',
    example: 'user',
  })
  slug: string;

  @ApiProperty({
    type: String,
    description: 'The action associated with the permission',
    example: 'create',
  })
  action: PermissionAction;

  @ApiProperty({
    type: String,
    description: 'A brief description of the permission',
    example: 'Permission to create a user',
  })
  description: string;

  constructor(p: Permission) {
    super(p);
    this.subject = p.subject;
    this.slug = p.slug;
    this.action = p.action;
    this.description = p.description;
  }
}
