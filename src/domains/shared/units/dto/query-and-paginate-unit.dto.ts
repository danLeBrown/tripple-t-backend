import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryUnitDto, SearchUnitDto } from './query-unit.dto';

export class QueryAndPaginateUnitDto extends IntersectionType(
  QueryUnitDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateUnitDto extends IntersectionType(
  SearchUnitDto,
  PaginationDto,
  OrderByDto,
) {}
