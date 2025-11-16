import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';

import { ActiveSubscriptionBenefitDto } from '../dto/activity-subscription-benefit.dto';
import { ActiveSubscription } from './active-subscription.entity';

@Entity({ name: 'active_subscription_benefits' })
@SetDto(ActiveSubscriptionBenefitDto)
export class ActiveSubscriptionBenefit extends BaseEntity<ActiveSubscriptionBenefitDto> {
  @Column({ type: 'uuid' })
  active_subscription_id: string;

  @Column({ type: 'varchar', length: 255 })
  benefit_name: string;

  @Column({ type: 'text', nullable: true })
  benefit_description: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  used: number | null;

  @Column({ type: 'int' })
  limit: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  percentage: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  duration_in_months: number | null;

  @ManyToOne(() => ActiveSubscription, (subscription) => subscription.benefits)
  @JoinColumn({ name: 'active_subscription_id', referencedColumnName: 'id' })
  active_subscription: ActiveSubscription;
}
