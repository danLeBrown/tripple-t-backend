import { IntersectionType, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateColourDto } from './create-colour.dto';

export class QueryColourDto extends IntersectionType(
  OmitType(PartialType(CreateColourDto), ['name'] as const),
  QueryDto,
) {}

export class SearchColourDto extends IntersectionType(QueryDto, SearchDto) {}
