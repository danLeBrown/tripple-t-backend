import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryLeadDto, SearchLeadDto } from './query-lead.dto';

export class QueryAndPaginateLeadDto extends IntersectionType(
  QueryLeadDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateLeadDto extends IntersectionType(
  SearchLeadDto,
  PaginationDto,
  OrderByDto,
) {}
