import { IntersectionType } from '@nestjs/swagger';

import { QueryDto } from '@/common/dto/query.dto';
import { SearchDto } from '@/common/dto/search.dto';

export class QueryStockDto extends IntersectionType(QueryDto) {}

export class SearchStockDto extends IntersectionType(QueryDto, SearchDto) {}
