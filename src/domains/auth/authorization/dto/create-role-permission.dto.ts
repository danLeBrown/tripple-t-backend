import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRolePermissionDto {
  @ApiProperty({
    type: String,
    description: 'The ID of the role',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  role_id: string;

  @ApiProperty({
    type: String,
    description: 'The ID of the permission',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  permission_id: string;
}

export class CreateRolePermissionsDto {
  @ApiProperty({
    type: [String],
    description: 'List of permission IDs to assign to the role',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
  })
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  permission_ids: string[];
}
