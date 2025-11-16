import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LeadsModule } from '../leads/leads.module';
import { DocumentsService } from './documents/documents.service';
import { Document } from './documents/entities/document.entity';
import { Tag } from './tags/entities/tag.entity';
import { TagsService } from './tags/tags.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tag, Document]), LeadsModule],
  controllers: [],
  providers: [TagsService, DocumentsService],
  exports: [TagsService, DocumentsService],
})
export class SharedModule {}
