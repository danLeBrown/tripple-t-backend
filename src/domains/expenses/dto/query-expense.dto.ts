import { IntersectionType, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateExpenseDto } from './create-expense.dto';

export class QueryExpenseDto extends IntersectionType(
  OmitType(PartialType(CreateExpenseDto), ['narration', 'amount'] as const),
  QueryDto,
) {}

export class SearchExpenseDto extends IntersectionType(QueryDto, SearchDto) {}
