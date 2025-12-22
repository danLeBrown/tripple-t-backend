import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import {
  QueryPurchaseRecordDto,
  SearchPurchaseRecordDto,
} from './query-purchase-record.dto';

export class QueryAndPaginatePurchaseRecordDto extends IntersectionType(
  QueryPurchaseRecordDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginatePurchaseRecordDto extends IntersectionType(
  SearchPurchaseRecordDto,
  PaginationDto,
  OrderByDto,
) {}
