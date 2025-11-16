/* eslint-disable max-classes-per-file */
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDocumentDto {
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
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'The unique identifier of the upload this resource is associated with.',
  })
  @IsUUID()
  upload_id: string;
}

export class CreateDocumentWithoutResourceDto extends OmitType(
  CreateDocumentDto,
  ['resource_id', 'resource_name'] as const,
) {}
