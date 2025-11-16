import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';
import { LeadsModule } from '../leads/leads.module';
import { SharedModule } from '../shared/shared.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [LeadsModule, ClientsModule, AuthModule, SharedModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [],
})
export class AnalyticsModule {}
