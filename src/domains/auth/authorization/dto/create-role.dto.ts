import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    type: String,
    description: 'The name of the role',
    example: 'Admin',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    description: 'A brief description of the role',
    example: 'Administrator with full access',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
