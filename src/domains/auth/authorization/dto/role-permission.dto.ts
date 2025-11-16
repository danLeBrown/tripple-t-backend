import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { RolePermission } from '../entities/role-permission.entity';
import { PermissionDto } from './permission.dto';

export class RolePermissionDto extends BaseDto {
  @ApiProperty({
    type: String,
    description: 'The ID of the role',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  role_id: string;

  @ApiProperty({
    type: String,
    description: 'The ID of the permission',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  permission_id: string;

  @ApiProperty({
    type: PermissionDto,
    description: 'The permission associated with the role',
    nullable: true,
  })
  permission?: PermissionDto;

  constructor(rolePermission: RolePermission) {
    super(rolePermission);
    this.role_id = rolePermission.role_id;
    this.permission_id = rolePermission.permission_id;

    if (rolePermission.permission) {
      this.permission = new PermissionDto(rolePermission.permission);
    }
  }
}
