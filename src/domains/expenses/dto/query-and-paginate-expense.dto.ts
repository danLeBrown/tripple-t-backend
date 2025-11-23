import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryExpenseDto, SearchExpenseDto } from './query-expense.dto';

export class QueryAndPaginateExpenseDto extends IntersectionType(
  QueryExpenseDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateExpenseDto extends IntersectionType(
  SearchExpenseDto,
  PaginationDto,
  OrderByDto,
) {}
