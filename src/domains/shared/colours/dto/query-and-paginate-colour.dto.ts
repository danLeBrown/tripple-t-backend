import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryColourDto, SearchColourDto } from './query-colour.dto';

export class QueryAndPaginateColourDto extends IntersectionType(
  QueryColourDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateColourDto extends IntersectionType(
  SearchColourDto,
  PaginationDto,
  OrderByDto,
) {}
