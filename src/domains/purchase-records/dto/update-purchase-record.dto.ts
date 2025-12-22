import { PartialType, PickType } from '@nestjs/swagger';

import { CreatePurchaseRecordDto } from './create-purchase-record.dto';

export class UpdatePurchaseRecordDto extends PartialType(
  PickType(CreatePurchaseRecordDto, [
    'quantity_in_bags',
    'price_per_bag',
    'purchased_at',
  ] as const),
) {}
