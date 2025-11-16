import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';
import { User } from '@/domains/auth/users/entities/user.entity';
import { Client } from '@/domains/clients/entities/client.entity';
import { Lead } from '@/domains/leads/entities/lead.entity';

import { BaseEntity } from '../../../../common/base.entity';
import { ActivityDto } from '../dto/activity.dto';

@Entity({ name: 'activities' })
@SetDto(ActivityDto)
export class Activity extends BaseEntity<ActivityDto> {
  @Column({ type: 'uuid' })
  admin_user_id: string;

  @Column({ type: 'varchar', length: 255 })
  resource_name: string;

  @Column({ type: 'uuid' })
  resource_id: string;

  @Column({ type: 'varchar', length: 255 })
  type: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_user_id', referencedColumnName: 'id' })
  admin_user?: User;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'id' })
  lead?: Lead;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'id' })
  client?: Client;
}
