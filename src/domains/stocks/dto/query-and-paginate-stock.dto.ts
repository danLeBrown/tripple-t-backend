import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryStockDto, SearchStockDto } from './query-stock.dto';

export class QueryAndPaginateStockDto extends IntersectionType(
  QueryStockDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateStockDto extends IntersectionType(
  SearchStockDto,
  PaginationDto,
  OrderByDto,
) {}
