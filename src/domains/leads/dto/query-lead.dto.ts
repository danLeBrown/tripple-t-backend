// eslint-disable-next-line max-classes-per-file
import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from '@/common/dto/query.dto';

import {
  LeadProduct,
  leadProduct,
  LeadScoreTag,
  leadScoreTag,
  LeadSource,
  leadSource,
  LeadStatus,
  leadStatus,
} from '../types';
import { CreateLeadDto } from './create-lead.dto';

export class QueryLeadDto extends IntersectionType(
  OmitType(PartialType(CreateLeadDto), ['first_name', 'last_name'] as const),
  QueryDto,
) {}

export class SearchLeadDto extends QueryDto {
  @ApiProperty({
    example: 'John',
    description: 'Search query for name, email, or phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(leadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(leadSource)
  source?: LeadSource;

  @IsOptional()
  @IsEnum(leadProduct)
  product?: LeadProduct;

  @IsOptional()
  @IsEnum(leadScoreTag)
  score_tag?: LeadScoreTag;

  @ApiProperty({
    example: 'uuid-string',
    description: 'Filter leads by admin user ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  admin_user_id?: string;
}
