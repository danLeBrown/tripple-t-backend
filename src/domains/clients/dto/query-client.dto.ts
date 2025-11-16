import { IntersectionType, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateClientDto } from './create-client.dto';

export class QueryClientDto extends IntersectionType(
  OmitType(PartialType(CreateClientDto), ['first_name', 'last_name'] as const),
  QueryDto,
) {}

export class SearchClientDto extends IntersectionType(QueryDto, SearchDto) {}
