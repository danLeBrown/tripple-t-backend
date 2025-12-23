import { IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateBottleProductionDto } from './create-bottle-production.dto';

export class QueryBottleProductionDto extends IntersectionType(
  OmitType(PartialType(CreateBottleProductionDto), [
    'preforms_used',
    'preforms_defective',
    'bottles_produced',
    'bottles_defective',
    'produced_at',
    'notes',
  ] as const),
  QueryDto,
) {
  @IsOptional()
  @IsUUID()
  customer_id?: string | null;

  @IsOptional()
  @IsUUID()
  supplier_id?: string | null;

  @IsOptional()
  @IsUUID()
  product_id?: string | null;
}

export class SearchBottleProductionDto extends IntersectionType(
  QueryDto,
  SearchDto,
) {}

