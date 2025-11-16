import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';
import { User } from '@/domains/auth/users/entities/user.entity';
import { Activity } from '@/domains/shared/activities/entities/activity.entity';
import { Document } from '@/domains/shared/documents/entities/document.entity';

import { BaseEntity } from '../../../common/base.entity';
import { ActiveSubscription } from '../club-members/active-subscription/entities/active-subscription.entity';
import { ClubMember } from '../club-members/entities/club-member.entity';
import { ClientDto } from '../dto/client.dto';
import { ClientStatus, clientStatus } from '../types';

@Entity({ name: 'clients' })
@SetDto(ClientDto)
export class Client extends BaseEntity<ClientDto> {
  @Column({ type: 'uuid', nullable: true })
  admin_user_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  lead_id: string | null;

  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  phone_number: string;

  @Column({ type: 'varchar', length: 255, default: clientStatus.Active })
  status: ClientStatus;

  @Column({ type: 'int', nullable: true })
  last_contacted_at: number | null;

  @Column({ type: 'int', nullable: true })
  next_follow_up_at?: number | null;

  @Column({ type: 'boolean', default: false })
  is_onboarded: boolean;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'admin_user_id', referencedColumnName: 'id' })
  admin_user?: User;

  @OneToMany(() => Activity, (activity) => activity.client)
  activities?: Activity[];

  @OneToMany(() => Document, (document) => document.client)
  documents?: Document[];

  @OneToOne(() => ClubMember, (clubMember) => clubMember.client)
  club_member?: ClubMember;

  @OneToMany(
    () => ActiveSubscription,
    (activeSubscription) => activeSubscription.client,
  )
  active_subscriptions?: ActiveSubscription[];
}
