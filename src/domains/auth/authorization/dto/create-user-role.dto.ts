import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateUserRoleDto {
  @ApiProperty({
    type: String,
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    type: String,
    description: 'The ID of the role',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  role_id: string;
}
