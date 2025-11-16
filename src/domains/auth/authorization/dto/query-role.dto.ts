import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateRoleDto } from './create-role.dto';

export class QueryRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty({
    type: String,
    description: 'The unique slug of the role',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug?: string;
}
