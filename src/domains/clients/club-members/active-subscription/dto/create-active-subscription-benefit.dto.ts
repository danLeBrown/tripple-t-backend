import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateActiveSubscriptionBenefitDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the active subscription',
  })
  @IsUUID()
  active_subscription_id: string;

  @ApiProperty({
    example: 'One on One Coaching',
    description: 'The name of the benefit',
  })
  @IsString()
  @IsNotEmpty()
  benefit_name: string;

  @ApiProperty({
    example: 'Personalized coaching sessions with a club coach',
    description: 'Description of the benefit',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  benefit_description?: string;

  @ApiProperty({
    example: 1,
    description: 'The number of times this benefit has been used',
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  used?: number;

  @ApiProperty({
    example: 1,
    description: 'The limit on the number of times this benefit can be used',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  limit: number;

  @ApiProperty({
    example: 10,
    description: 'The percentage discount applied to this benefit',
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  percentage?: number;

  @ApiProperty({
    example: 30,
    description: 'The duration in months for which this benefit is valid',
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  duration_in_months?: number;
}

export class CreateActiveSubscriptionBenefitWithoutIdDto extends OmitType(
  CreateActiveSubscriptionBenefitDto,
  ['active_subscription_id'] as const,
) {}
