import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { FollowUpsService } from '@/domains/shared/follow-ups/follow-ups.service';

import { UpdateClientDto } from '../dto/update-client.dto';
import { Client } from '../entities/client.entity';

export interface ClientsUpdatedEvent {
  client: Client;
  dto: UpdateClientDto;
}

@Injectable()
export class ClientsUpdatedListener {
  constructor(private followupsService: FollowUpsService) {}

  @OnEvent('client.updated', {
    async: true,
    promisify: true,
  })
  async handleEvent(event: ClientsUpdatedEvent) {
    const { client, dto } = event;

    if (!dto.next_follow_up_at || !client.admin_user_id) {
      return null;
    }

    return this.followupsService.createForClient(client.id, {
      user_id: client.admin_user_id,
      follow_up_at: dto.next_follow_up_at,
    });
  }
}
