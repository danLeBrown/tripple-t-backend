import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';

import { ImportClientsService } from '@/domains/clients/import-client.service';

import { Webhook } from '../entities/webhook.entity';
import { IC9JAWebhook } from '../interfaces';

@Processor('webhooks')
export class WebhookProcessor extends WorkerHost {
  private logger = new Logger(WebhookProcessor.name);

  constructor(
    @InjectRepository(Webhook)
    private readonly repo: Repository<Webhook>,
    private importClientsService: ImportClientsService,
  ) {
    super();
  }

  async process(job: Job<Webhook>): Promise<unknown> {
    switch (job.name) {
      case 'webhook.execute':
        return this.executeWebhook(job.data);

      default:
    }
  }

  private async executeWebhook(data: Webhook) {
    this.logger.log(`Processing webhook created job for event: ${data.event}`);

    await this.repo.update(data.id, { status: 'processing' });

    try {
      if (
        data.event === 'subscription.created' ||
        data.event === 'subscription.updated'
      ) {
        let payload: IC9JAWebhook;
        try {
          payload = JSON.parse(data.data) as IC9JAWebhook;
        } catch (jsonError) {
          this.logger.error(
            `Invalid JSON in webhook data for event ${data.event}: ${jsonError.message}`,
          );
          return this.repo.update(data.id, { status: 'failed' });
        }

        await this.importClientsService.importClient(payload.data.user);
      }

      return this.repo.update(data.id, { status: 'processed' });
    } catch (error) {
      this.logger.error(
        `Error processing webhook created job: ${error.message}`,
      );

      return this.repo.update(data.id, { status: 'failed' });
    }
  }
}
