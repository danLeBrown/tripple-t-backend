import { PartialType } from '@nestjs/swagger';

import { CreateBottleProductionDto } from './create-bottle-production.dto';

export class UpdateBottleProductionDto extends PartialType(
  CreateBottleProductionDto,
) {}

