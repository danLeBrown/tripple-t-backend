import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { getUnixTime, subMinutes } from 'date-fns';
import { FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';

import { CreateWebhookDto } from './dto/create-webhook.dto';
import { Webhook } from './entities/webhook.entity';

@Injectable()
export class WebhooksService {
  private logger = new Logger(WebhooksService.name);
  constructor(
    @InjectRepository(Webhook)
    private repo: Repository<Webhook>,
    @InjectQueue('webhooks')
    private queue: Queue,
  ) {}

  async create(dto: CreateWebhookDto) {
    const exists = await this.repo.findOne({
      where: { event: dto.event, reference: dto.reference },
    });

    if (exists) {
      this.logger.warn(
        `Webhook with event ${dto.event} and reference ${dto.reference} already exists.`,
      );

      if (
        exists.status === 'pending' &&
        exists.created_at <= getUnixTime(subMinutes(new Date(), 5))
      ) {
        // Retry the webhook if it was created more than 5 minutes ago
        await this.queue.add('webhook.execute', exists);
        return exists;
      }

      return exists;
    }

    const webhook = await this.repo.save(
      this.repo.create({
        ...dto,
        status: 'pending',
        data: JSON.stringify(dto.data),
      }),
    );

    await this.queue.add('webhook.execute', webhook);

    return webhook;
  }

  async findBy(q?: FindOptionsWhere<Webhook>): Promise<Webhook[]> {
    return this.repo.find({
      where: q,
      order: { created_at: 'DESC' },
    });
  }

  async retry(id: string) {
    const webhook = await this.repo.findOne({ where: { id } });

    if (!webhook) {
      throw new NotFoundException(`Webhook not found`);
    }

    await this.queue.add('webhook.execute', webhook);
  }
}
