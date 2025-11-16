import { IntersectionType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateClubMemberDto } from './create-club-member.dto';

export class QueryClubMemberDto extends IntersectionType(
  PartialType(CreateClubMemberDto),
  QueryDto,
) {}

export class SearchClubMemberDto extends IntersectionType(
  QueryDto,
  SearchDto,
) {}
