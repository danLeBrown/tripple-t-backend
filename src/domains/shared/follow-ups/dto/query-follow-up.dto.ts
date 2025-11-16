import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

import { CreateFollowUpDto } from './create-follow-up.dto';

export class QueryFollowUpDto extends PartialType(CreateFollowUpDto) {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'boolean' ? Boolean(value) : value === 'true',
  )
  is_done?: boolean;
}
