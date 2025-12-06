import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryProductDto, SearchProductDto } from './query-Product.dto';

export class QueryAndPaginateProductDto extends IntersectionType(
  QueryProductDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateProductDto extends IntersectionType(
  SearchProductDto,
  PaginationDto,
  OrderByDto,
) {}
