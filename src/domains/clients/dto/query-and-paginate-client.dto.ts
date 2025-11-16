import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryClientDto, SearchClientDto } from './query-client.dto';

export class QueryAndPaginateClientDto extends IntersectionType(
  QueryClientDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateClientDto extends IntersectionType(
  SearchClientDto,
  PaginationDto,
  OrderByDto,
) {}
