import { IntersectionType } from '@nestjs/swagger';

import { PaginationDto } from '@/common/dto/pagination.dto';
import { OrderByDto } from '@/common/dto/pagination.dto';

import {
  QueryClubMemberDto,
  SearchClubMemberDto,
} from './query-club-member.dto';

export class QueryAndPaginateClubMemberDto extends IntersectionType(
  QueryClubMemberDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateClubMemberDto extends IntersectionType(
  SearchClubMemberDto,
  PaginationDto,
  OrderByDto,
) {}
