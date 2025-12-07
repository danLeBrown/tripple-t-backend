import { IntersectionType, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateCustomerDto } from './create-customer.dto';

export class QueryCustomerDto extends IntersectionType(
  OmitType(PartialType(CreateCustomerDto), [
    'business_name',
    'contact_person_first_name',
    'contact_person_last_name',
    'contact_person_email',
    'contact_person_phone_number',
    'address',
    'state',
  ] as const),
  QueryDto,
) {}

export class SearchCustomerDto extends IntersectionType(QueryDto, SearchDto) {}
