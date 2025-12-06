import { IntersectionType, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateUnitDto } from './create-unit.dto';

export class QueryUnitDto extends IntersectionType(
  OmitType(PartialType(CreateUnitDto), ['name', 'symbol'] as const),
  QueryDto,
) {}

export class SearchUnitDto extends IntersectionType(QueryDto, SearchDto) {}
