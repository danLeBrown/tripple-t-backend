import { PickType } from '@nestjs/swagger';

import { CreateExpenseDto } from './create-expense.dto';

export class UpdateExpenseDto extends PickType(CreateExpenseDto, [
  'narration',
  'has_been_calculated',
] as const) {}
