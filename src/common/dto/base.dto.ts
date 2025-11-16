import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '../base.entity';

export class BaseDto {
  @ApiProperty({
    description: 'The id of the entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The created at timestamp of the entity',
    example: 1716835200,
  })
  created_at: number;

  @ApiProperty({
    description: 'The updated at timestamp of the entity',
    example: 1716835200,
  })
  updated_at: number;

  constructor(entity: BaseEntity<BaseDto>) {
    this.id = entity.id;
    this.created_at = entity.created_at;
    this.updated_at = entity.updated_at;
  }

  static collection<T extends BaseDto>(entities: Array<BaseEntity<T>>): T[] {
    return entities.map((entity) => new this(entity) as T);
  }
}
