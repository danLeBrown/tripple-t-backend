import { PartialType, PickType } from '@nestjs/swagger';

import { CreateBottleProductionDto } from './create-bottle-production.dto';

export class UpdateBottleProductionDto extends PartialType(
  PickType(CreateBottleProductionDto, [
    'preforms_used',
    'preforms_defective',
    'bottles_produced',
    'bottles_defective',
    'bottle_color',
    'notes',
  ] as const),
) {}
