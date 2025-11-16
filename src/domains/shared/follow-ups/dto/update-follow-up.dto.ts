import { PickType } from '@nestjs/swagger';

import { CreateFollowUpDto } from './create-follow-up.dto';

export class RescheduleFollowUpDto extends PickType(CreateFollowUpDto, [
  'follow_up_at',
] as const) {}
