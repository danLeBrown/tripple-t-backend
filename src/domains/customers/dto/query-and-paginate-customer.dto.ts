import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryCustomerDto, SearchCustomerDto } from './query-customer.dto';

export class QueryAndPaginateCustomerDto extends IntersectionType(
  QueryCustomerDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateCustomerDto extends IntersectionType(
  SearchCustomerDto,
  PaginationDto,
  OrderByDto,
) {}
