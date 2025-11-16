import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';
import { Activity } from '@/domains/shared/activities/entities/activity.entity';
import { Document } from '@/domains/shared/documents/entities/document.entity';

import { BaseEntity } from '../../../../common/base.entity';
import { Client } from '../../entities/client.entity';
import { ClubMemberDto } from '../dto/club-member.dto';
import { ClubMemberStatus, clubMemberStatus } from '../types';

@Entity({ name: 'club_members' })
@SetDto(ClubMemberDto)
export class ClubMember extends BaseEntity<ClubMemberDto> {
  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'varchar', length: 255 })
  company_name: string;

  @Column({ type: 'varchar', length: 255 })
  company_address: string;

  @Column({ type: 'varchar', length: 255 })
  job_role: string;

  @Column({ type: 'varchar', length: 255 })
  organization_type: string;

  @Column({ type: 'varchar', length: 255 })
  services: string;

  @Column({ type: 'varchar', length: 255 })
  team_size: string;

  @Column({ type: 'varchar', length: 255, default: clubMemberStatus.Active })
  status: ClubMemberStatus;

  @Column({ type: 'int', nullable: true })
  last_contacted_at: number | null;

  @OneToOne(() => Client, (client) => client.club_member)
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
  client?: Client;

  @OneToMany(() => Activity, (activity) => activity.client)
  activities?: Activity[];

  @OneToMany(() => Document, (document) => document.client)
  documents?: Document[];
}
