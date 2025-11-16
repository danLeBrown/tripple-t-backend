import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';

import { Webhook } from '../entities/webhook.entity';

@Processor('webhooks')
export class WebhookProcessor extends WorkerHost {
  private logger = new Logger(WebhookProcessor.name);

  constructor(
    @InjectRepository(Webhook)
    private readonly repo: Repository<Webhook>,
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
  }
}
