import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreatePermissionDto } from './create-permission.dto';

export class QueryPermissionDto extends PartialType(CreatePermissionDto) {
  @ApiProperty({
    type: String,
    description: 'The unique slug of the permission',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug?: string;
}
