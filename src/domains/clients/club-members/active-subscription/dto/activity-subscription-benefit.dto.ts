import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import { ActiveSubscriptionBenefit } from '../entities/active-subscription-benefit.entity';

export class ActiveSubscriptionBenefitDto extends BaseDto {
  @ApiProperty({
    example: 'One on One Coaching',
    description: 'The name of the benefit',
  })
  benefit_name: string;

  @ApiProperty({
    example: 'Personalized coaching sessions with a club coach',
    description: 'Description of the benefit',
    nullable: true,
  })
  benefit_description: string | null;

  @ApiProperty({
    example: 1,
    description: 'The number of times this benefit has been used',
    nullable: true,
  })
  used: number | null;

  @ApiProperty({
    example: 1,
    description: 'The limit on the number of times this benefit can be used',
  })
  limit: number;

  @ApiProperty({
    example: 10,
    description: 'The percentage discount applied to this benefit',
  })
  percentage: number | null;

  @ApiProperty({
    example: 30,
    description: 'The duration in months for which this benefit is valid',
  })
  duration_in_months: number | null;

  constructor(benefit: ActiveSubscriptionBenefit) {
    super(benefit);
    this.benefit_name = benefit.benefit_name;
    this.benefit_description = benefit.benefit_description;
    this.used = benefit.used;
    this.limit = benefit.limit;
    this.percentage = benefit.percentage;
    this.duration_in_months = benefit.duration_in_months;
  }
}
