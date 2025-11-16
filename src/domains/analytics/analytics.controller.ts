import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AnalyticsService } from './analytics.service';

@ApiBearerAuth()
@Controller({
  path: 'analytics',
  version: '1',
})
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}
}
