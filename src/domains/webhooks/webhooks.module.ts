import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Webhook } from './entities/webhook.entity';
import { WebhookProcessor } from './processors/webhook.processor';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Webhook]),
    BullModule.registerQueue({ name: 'webhooks' }),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookProcessor],
  exports: [WebhooksService],
})
export class WebhooksModule {}
