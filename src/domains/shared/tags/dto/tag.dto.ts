import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { Tag } from '../entities/tag.entity';

export class TagDto extends BaseDto {
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
    example: 'high_priority',
    description:
      'The value of the tag, e.g., "high_priority", "follow_up", etc.',
  })
  value: string;

  constructor(entity: Tag) {
    super(entity);
    this.resource_name = entity.resource_name;
    this.resource_id = entity.resource_id;
    this.value = entity.value;
  }

  // static collection(entities: Tag[]): TagDto[] {
  //   return entities.map((entity) => new TagDto(entity));
  // }
}
