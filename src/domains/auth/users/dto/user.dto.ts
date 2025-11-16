import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../../common/dto/base.dto';
import { UserRoleDto } from '../../authorization/dto/user-role.dto';
import { User } from '../entities/user.entity';
import { UserStatus } from '../types';

export class UserDto extends BaseDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  full_name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '08123456789',
  })
  phone_number: string;

  @ApiProperty({
    description: 'User is_admin',
    example: true,
  })
  is_admin: boolean;

  @ApiProperty({
    description: 'User status',
    example: 'active',
  })
  status: UserStatus;

  @ApiProperty({
    description: 'Timestamp of the last login',
    example: 1627847261,
    nullable: true,
  })
  last_login_at: number | null;

  @ApiProperty({ type: () => UserRoleDto })
  user_role?: UserRoleDto;

  constructor(user: User) {
    super(user);
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.full_name = `${user.first_name} ${user.last_name}`;
    this.email = user.email;
    this.phone_number = user.phone_number;
    this.is_admin = user.is_admin;
    this.status = user.status;
    this.last_login_at = user.last_login_at;

    if (user.user_role) {
      this.user_role = new UserRoleDto(user.user_role);
    }
  }

  // static collection(users: User[]): UserDto[] {
  //   return users.map((user) => new UserDto(user));
  // }
}
