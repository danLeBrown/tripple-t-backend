import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { CreateActiveSubscriptionBenefitWithoutIdDto } from './create-active-subscription-benefit.dto';

export class CreateActiveSubscriptionDto {
  @ApiProperty({
    example: 'client_id',
    description: 'The ID of the client associated with the subscription',
  })
  @IsUUID()
  client_id: string;

  @ApiProperty({
    example: 'Single Membership',
    description: 'The name of the subscription plan',
  })
  @IsString()
  plan_name: string;

  @ApiProperty({
    example: 'A single membership plan for club access',
    description: 'Description of the subscription plan',
  })
  @IsString()
  plan_description: string;

  @ApiProperty({
    example: 1000,
    description: 'The price of the subscription in cents',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  price: number;

  @ApiProperty({
    example: 30,
    description: 'The duration of the subscription in days',
  })
  duration_in_days: number;

  @ApiProperty({
    example: 1716835200,
    description: 'The timestamp when the subscription was activated',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  activated_at: number;

  @ApiProperty({
    example: 1716835200,
    description: 'The timestamp when the subscription was paused',
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  paused_at?: number;

  @ApiProperty({
    example: 1716835200,
    description: 'The timestamp when the subscription was resumed',
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  terminated_at?: number;

  @ApiProperty({
    example: 1716835200,
    description: 'The timestamp when the subscription will expire',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  expired_at: number;

  @ApiProperty({
    type: [CreateActiveSubscriptionBenefitWithoutIdDto],
    description: 'List of benefits associated with the active subscription',
    required: false,
  })
  @IsOptional()
  @IsArray()
  //   @IsNotEmpty({ each: true })
  @Type(() => CreateActiveSubscriptionBenefitWithoutIdDto)
  @ValidateNested({ each: true })
  //   @ArrayNotEmpty()
  benefits?: CreateActiveSubscriptionBenefitWithoutIdDto[];
}
