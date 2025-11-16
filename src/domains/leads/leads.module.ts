import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Lead } from './entities/lead.entity';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadsUpdatedListener } from './listeners/leads-updated.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), AuthModule],
  controllers: [LeadsController],
  providers: [LeadsService, LeadsUpdatedListener],
  exports: [LeadsService],
})
export class LeadsModule {}
