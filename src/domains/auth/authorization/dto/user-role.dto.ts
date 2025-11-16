import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';
import { UserDto } from '@/domains/auth/users/dto/user.dto';

import { UserRole } from '../entities/user-role.entity';
import { RoleDto } from './role.dto';

export class UserRoleDto extends BaseDto {
  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id: string;

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  role_id: string;

  @ApiProperty({
    type: RoleDto,
    description: 'Role associated with the user role',
    nullable: true,
  })
  role?: RoleDto;

  @ApiProperty({
    type: () => UserDto,
    description: 'User associated with the user role',
    nullable: true,
  })
  user?: UserDto;

  constructor(user_role: UserRole) {
    super(user_role);
    this.user_id = user_role.user_id;
    this.role_id = user_role.role_id;

    if (user_role.role) {
      this.role = new RoleDto(user_role.role);
    }

    if (user_role.user) {
      this.user = new UserDto(user_role.user);
    }
  }
}
