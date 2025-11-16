import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}

export class UpdateUserPasswordDto {
  @ApiProperty({
    description: 'The old password of the user',
    example: 'oldpassword123',
  })
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @ApiProperty({
    description: 'The new password of the user',
    example: 'newsecurepassword456',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
