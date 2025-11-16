import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { ActiveSubscription } from '../entities/active-subscription.entity';
import { ActiveSubscriptionBenefitDto } from './activity-subscription-benefit.dto';

export class ActiveSubscriptionDto extends BaseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the client associated with the subscription',
  })
  client_id: string;

  @ApiProperty({
    example: 'Single Membership',
    description: 'The name of the subscription plan',
  })
  plan_name: string;

  @ApiProperty({
    example: 'A single membership plan for club access',
    description: 'Description of the subscription plan',
  })
  plan_description: string;

  @ApiProperty({
    example: 30,
    description: 'The duration of the subscription in days',
  })
  duration_in_days: number;

  @ApiProperty({
    example: 1678901237,
    description: 'The price of the subscription in cents',
  })
  price: number;

  @ApiProperty({
    example: 'abc123',
    description: 'A unique hash for the subscription',
  })
  hash: string;

  @ApiProperty({
    example: 1716835200,
    description: 'The timestamp when the subscription was activated',
  })
  activated_at: number;

  @ApiProperty({
    example: 1716835200,
    description: 'The timestamp when the subscription was paused',
  })
  paused_at: number | null;

  @ApiProperty({
    example: 1716835200,
    description: 'The timestamp when the subscription was resumed',
  })
  terminated_at: number | null;

  @ApiProperty({
    example: 1716835200,
    description: 'The timestamp when the subscription will expire',
  })
  expired_at: number;

  @ApiProperty({
    type: [ActiveSubscriptionBenefitDto],
    description: 'List of benefits associated with the active subscription',
  })
  benefits?: ActiveSubscriptionBenefitDto[];

  constructor(subscription: ActiveSubscription) {
    super(subscription);
    this.client_id = subscription.client_id;
    this.plan_name = subscription.plan_name;
    this.plan_description = subscription.plan_description;
    this.duration_in_days = subscription.duration_in_days;
    this.price = subscription.price;
    this.hash = subscription.hash;
    this.activated_at = subscription.activated_at;
    this.paused_at = subscription.paused_at;
    this.terminated_at = subscription.terminated_at;
    this.expired_at = subscription.expired_at;

    if (subscription.benefits) {
      this.benefits = ActiveSubscriptionBenefitDto.collection(
        subscription.benefits,
      );
    }
  }
}
