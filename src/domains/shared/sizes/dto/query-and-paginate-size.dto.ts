import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QuerySizeDto, SearchSizeDto } from './query-size.dto';

export class QueryAndPaginateSizeDto extends IntersectionType(
  QuerySizeDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateSizeDto extends IntersectionType(
  SearchSizeDto,
  PaginationDto,
  OrderByDto,
) {}
