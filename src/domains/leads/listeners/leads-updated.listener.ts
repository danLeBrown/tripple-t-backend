import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { FollowUpsService } from '@/domains/shared/follow-ups/follow-ups.service';

import { UpdateLeadDto } from '../dto/update-lead.dto';
import { Lead } from '../entities/lead.entity';

export interface LeadsUpdatedEvent {
  lead: Lead;
  dto: UpdateLeadDto;
}

@Injectable()
export class LeadsUpdatedListener {
  constructor(private followupsService: FollowUpsService) {}

  @OnEvent('lead.updated', {
    async: true,
    promisify: true,
  })
  async handleEvent(event: LeadsUpdatedEvent) {
    const { lead, dto } = event;

    if (!dto.next_follow_up_at || !lead.admin_user_id) {
      return null;
    }

    return this.followupsService.createForLead(lead.id, {
      user_id: lead.admin_user_id,
      follow_up_at: dto.next_follow_up_at,
    });
  }
}
