import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [AuthModule, SharedModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [],
})
export class AnalyticsModule {}
