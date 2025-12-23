import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import {
  QueryBottleProductionDto,
  SearchBottleProductionDto,
} from './query-bottle-production.dto';

export class QueryAndPaginateBottleProductionDto extends IntersectionType(
  QueryBottleProductionDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateBottleProductionDto extends IntersectionType(
  SearchBottleProductionDto,
  PaginationDto,
  OrderByDto,
) {}
