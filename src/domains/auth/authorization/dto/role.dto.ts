import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { Role } from '../entities/role.entity';
import { RolePermissionDto } from './role-permission.dto';

export class RoleDto extends BaseDto {
  @ApiProperty({
    type: String,
    description: 'The name of the role',
    example: 'Admin',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'The unique slug of the role',
    example: 'admin',
  })
  slug: string;

  @ApiProperty({
    type: String,
    description: 'A brief description of the role',
    example: 'Administrator with full access',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    type: [RolePermissionDto],
    description: 'List of permissions associated with the role',
    nullable: true,
  })
  permissions?: RolePermissionDto[];

  constructor(r: Role) {
    super(r);
    this.name = r.name;
    this.slug = r.slug;
    this.description = r.description;

    if (r.permissions) {
      this.permissions = r.permissions.map((p) => new RolePermissionDto(p));
    }
  }
}
