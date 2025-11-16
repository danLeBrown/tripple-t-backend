import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';
import { Lead } from '@/domains/leads/entities/lead.entity';

import { BaseEntity } from '../../../../common/base.entity';
import { TagDto } from '../dto/tag.dto';

@Entity({ name: 'tags' })
@SetDto(TagDto)
export class Tag extends BaseEntity<TagDto> {
  @Column({ type: 'varchar', length: 255 })
  resource_name: string;

  @Column({ type: 'uuid' })
  resource_id: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'id' })
  lead?: Lead;
}
