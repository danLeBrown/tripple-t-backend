import {
  AfterInsert,
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';
import { User } from '@/domains/auth/users/entities/user.entity';
import { Client } from '@/domains/clients/entities/client.entity';
import { Lead } from '@/domains/leads/entities/lead.entity';

import { BaseEntity } from '../../../../common/base.entity';
import { FollowUpDto } from '../dto/follow-up.dto';
import { formatFollowUpStatus } from '../helpers';
import { FollowUpStatus, ResourceName } from '../types';

@Entity('follow_ups')
@SetDto(FollowUpDto)
export class FollowUp extends BaseEntity<FollowUpDto> {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  resource_id: string;

  @Column({ type: 'varchar', length: 255 })
  resource_name: ResourceName;

  @Column({ type: 'boolean', default: false })
  is_done: boolean;

  @Column({ type: 'int' })
  follow_up_at: number;

  status: FollowUpStatus;

  @AfterLoad()
  setStatusAfterLoad() {
    this.status = formatFollowUpStatus(this);
  }

  @AfterInsert()
  setStatusAfterInsert() {
    this.status = formatFollowUpStatus(this);
  }

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'id' })
  client?: Client;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'id' })
  lead?: Lead;
}
