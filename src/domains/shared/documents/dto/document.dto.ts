import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';
import { UploadDto } from '@/domains/uploads/dto/upload.dto';

import { Document } from '../entities/document.entity';

export class DocumentDto extends BaseDto {
  @ApiProperty({
    example: 'leads',
    description:
      'The type of resource this tag is associated with, e.g., "leads", "clients", etc.',
  })
  resource_name: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'The unique identifier of the resource this tag is associated with.',
  })
  resource_id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'The unique identifier of the upload this resource is associated with.',
  })
  upload_id: string;

  @ApiProperty({
    type: UploadDto,
    description: 'The upload associated with this document',
  })
  upload?: UploadDto;

  constructor(entity: Document) {
    super(entity);
    this.resource_name = entity.resource_name;
    this.resource_id = entity.resource_id;
    this.upload_id = entity.upload_id;

    if (entity.upload) {
      this.upload = new UploadDto(entity.upload);
    }
  }

  // static collection(entities: Document[]): DocumentDto[] {
  //   return entities.map((entity) => new DocumentDto(entity));
  // }
}
