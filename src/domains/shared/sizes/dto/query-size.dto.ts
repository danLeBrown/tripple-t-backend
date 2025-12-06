import { IntersectionType, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateSizeDto } from './create-size.dto';

export class QuerySizeDto extends IntersectionType(
  OmitType(PartialType(CreateSizeDto), ['value'] as const),
  QueryDto,
) {}

export class SearchSizeDto extends IntersectionType(QueryDto, SearchDto) {}
