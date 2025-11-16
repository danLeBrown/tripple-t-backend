import { ApiProperty } from '@nestjs/swagger';

import { getMonthNameFromNumber } from '../helpers';

export class TrendAnalyticsDto {
  @ApiProperty({
    description: 'The name of the trend',
    example: 'revenue_trends',
  })
  name: string;

  @ApiProperty({
    description: 'The data points for the trend',
    example: [
      { month: 'Jan', value: 100 },
      { month: 'Feb', value: 200 },
    ],
  })
  data: Array<{ month: string; value: number }>;

  constructor(partial: {
    name: string;
    data: Array<{ month: number; value: number }>;
  }) {
    this.name = partial.name;
    this.data = partial.data.map((item) => ({
      month: getMonthNameFromNumber(item.month),
      value: Number(item.value),
    }));
  }
}
