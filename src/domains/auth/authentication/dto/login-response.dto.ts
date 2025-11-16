import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/domains/auth/users/dto/user.dto';
import { User } from '@/domains/auth/users/entities/user.entity';

export class LoginResponseDto {
  @ApiProperty({
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6',
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6',
  })
  refresh_token: string;

  @ApiProperty({
    description: "Indicates if this is the user's first login",
    example: false,
  })
  is_first_login: boolean;

  constructor(
    user: User,
    tokens: { access_token: string; refresh_token: string },
    is_first_login = false,
  ) {
    this.user = user.toDto();
    this.access_token = tokens.access_token;
    this.refresh_token = tokens.refresh_token;
    this.is_first_login = is_first_login;
  }
}
