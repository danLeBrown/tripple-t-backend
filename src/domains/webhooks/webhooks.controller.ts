import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { hash } from 'typeorm/util/StringUtils';

import { AuditLog } from '../../decorators/audit-log.decorator';
import { UnauthenticatedRoute } from '../../decorators/unauthenticated.decorator';
import { ConnectNigeriaWebhookDto } from './dto/connect-nigeria-webhook.dto';
import { WebhookDto } from './dto/webhook.dto';
import { WebhooksService } from './webhooks.service';

@Controller({ path: 'webhooks', version: '1' })
@UnauthenticatedRoute()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @AuditLog({
    model: 'Webhook',
    action: 'Connect Nigeria Webhook received',
  })
  @ApiOkResponse({
    description: 'Webhook created successfully',
    type: WebhookDto,
  })
  @Post('connect-nigeria')
  async create(
    @Body()
    dto: ConnectNigeriaWebhookDto,
  ) {
    await this.webhooksService.create({
      provider: 'connect-nigeria',
      event: dto.event,
      reference: hash(JSON.stringify(dto)),
      data: dto as unknown as Record<string, unknown>,
    });

    return {
      message: 'Webhook received',
    };
  }

  @Patch(':id/retry')
  async retry(@Param('id', ParseUUIDPipe) id: string) {
    await this.webhooksService.retry(id);
    return {
      message: 'Webhook retry initiated',
    };
  }
}
