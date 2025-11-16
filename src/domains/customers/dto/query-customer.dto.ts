import { IntersectionType, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateCustomerDto } from './create-customer.dto';

export class QueryCustomerDto extends IntersectionType(
  OmitType(PartialType(CreateCustomerDto), [
    'first_name',
    'last_name',
  ] as const),
  QueryDto,
) {}

export class SearchCustomerDto extends IntersectionType(QueryDto, SearchDto) {}
