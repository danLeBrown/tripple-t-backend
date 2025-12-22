import { IntersectionType, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreatePurchaseRecordDto } from './create-purchase-record.dto';

export class QueryPurchaseRecordDto extends IntersectionType(
  OmitType(PartialType(CreatePurchaseRecordDto), [
    'upload_id',
    'product_id',
    'supplier_id',
    'quantity_in_bags',
    'price_per_bag',
    'purchased_at',
  ] as const),
  QueryDto,
) {}

export class SearchPurchaseRecordDto extends IntersectionType(
  QueryDto,
  SearchDto,
) {}
