import { PartialType } from '@nestjs/swagger';

import { CreateActiveSubscriptionDto } from './create-active-subscription.dto';

export class UpdateActiveSubscriptionDto extends PartialType(
  CreateActiveSubscriptionDto,
) {}
