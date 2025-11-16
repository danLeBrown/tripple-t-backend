import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsModule } from '../clients/clients.module';
import { LeadsModule } from '../leads/leads.module';
import { ActivitiesService } from './activities/activities.service';
import { Activity } from './activities/entities/activity.entity';
import { DocumentsService } from './documents/documents.service';
import { Document } from './documents/entities/document.entity';
import { FollowUp } from './follow-ups/entities/follow-up.entity';
import { FollowUpsController } from './follow-ups/follow-ups.controller';
import { FollowUpsService } from './follow-ups/follow-ups.service';
import { Tag } from './tags/entities/tag.entity';
import { TagsService } from './tags/tags.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, Activity, Document, FollowUp]),
    LeadsModule,
    ClientsModule,
  ],
  controllers: [FollowUpsController],
  providers: [
    TagsService,
    ActivitiesService,
    DocumentsService,
    FollowUpsService,
  ],
  exports: [TagsService, ActivitiesService, DocumentsService, FollowUpsService],
})
export class SharedModule {}
