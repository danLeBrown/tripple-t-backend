import { PickType } from '@nestjs/swagger';

import { CreateStockDto } from './create-stock.dto';

export class UpdateStockDto extends PickType(CreateStockDto, [
  'unit',
] as const) {}
