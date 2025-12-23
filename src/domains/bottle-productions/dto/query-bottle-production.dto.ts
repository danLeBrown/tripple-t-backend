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
  preform_supplier_id?: string;

  @IsOptional()
  @IsUUID()
  preform_product_id?: string;

  @IsOptional()
  @IsUUID()
  bottle_product_id?: string;
}

export class SearchBottleProductionDto extends IntersectionType(
  QueryDto,
  SearchDto,
) {}

