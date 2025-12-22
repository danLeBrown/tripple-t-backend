import { IntersectionType, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

import { CreateUploadDto } from './create-upload.dto';

export class QueryUploadDto extends IntersectionType(
  OmitType(PartialType(CreateUploadDto), ['name', 'relative_url'] as const),
  QueryDto,
) {}

export class SearchUploadDto extends IntersectionType(QueryDto, SearchDto) {}
