import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';
import { Client } from '@/domains/clients/entities/client.entity';

import { ActiveSubscriptionDto } from '../dto/active-subscription.dto';
import { ActiveSubscriptionBenefit } from './active-subscription-benefit.entity';

@Entity({ name: 'active_subscriptions' })
@SetDto(ActiveSubscriptionDto)
export class ActiveSubscription extends BaseEntity<ActiveSubscriptionDto> {
  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'varchar', length: 255 })
  plan_name: string;

  @Column({ type: 'text' })
  plan_description: string;

  @Column({ type: 'int', unsigned: true })
  duration_in_days: number;

  @Column({ type: 'int', unsigned: true })
  price: number;

  @Column({ type: 'varchar', length: 255 })
  hash: string;

  @Column({ type: 'int' })
  activated_at: number;

  @Column({ type: 'int', nullable: true })
  paused_at: number | null;

  @Column({ type: 'int', nullable: true })
  terminated_at: number | null;

  @Column({ type: 'int' })
  expired_at: number;

  @OneToOne(
    () => ActiveSubscriptionBenefit,
    (benefit) => benefit.active_subscription,
  )
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
  client?: Client;

  @OneToMany(
    () => ActiveSubscriptionBenefit,
    (benefit) => benefit.active_subscription,
    {
      eager: true,
    },
  )
  benefits?: ActiveSubscriptionBenefit[];
}
