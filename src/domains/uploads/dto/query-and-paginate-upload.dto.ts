import { IntersectionType } from '@nestjs/swagger';

import { OrderByDto, PaginationDto } from '@/common/dto/pagination.dto';

import { QueryUploadDto, SearchUploadDto } from './query-upload.dto';

export class QueryAndPaginateUploadDto extends IntersectionType(
  QueryUploadDto,
  PaginationDto,
  OrderByDto,
) {}

export class SearchAndPaginateUploadDto extends IntersectionType(
  SearchUploadDto,
  PaginationDto,
  OrderByDto,
) {}
