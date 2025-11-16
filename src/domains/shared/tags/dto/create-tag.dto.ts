// eslint-disable-next-line max-classes-per-file
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    example: 'leads',
    description:
      'The type of resource this tag is associated with, e.g., "leads", "clients", etc.',
  })
  @IsString()
  @IsNotEmpty()
  resource_name: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'The unique identifier of the resource this tag is associated with.',
  })
  @IsUUID()
  resource_id: string;

  @ApiProperty({
    example: 'Technology',
    description: 'The value of the tag, e.g., "Technology", "Marketing", etc.',
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class UpdateTagDto extends PartialType(CreateTagDto) {}

export class CreateTagWithoutResourceDto extends OmitType(CreateTagDto, [
  'resource_name',
  'resource_id',
] as const) {}
