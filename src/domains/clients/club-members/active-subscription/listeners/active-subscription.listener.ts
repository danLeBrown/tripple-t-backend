import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ActiveSubscriptionsService } from '../active-subscriptions.service';
import { ActiveSubscriptionCreatedEvent } from '../events/active-subscription.event';

@Injectable()
export class ActiveSubscriptionListener {
  constructor(private readonly service: ActiveSubscriptionsService) {}

  @OnEvent('active-subscription.created', { async: true, promisify: true })
  async handleActiveSubscriptionCreatedEvent(
    data: ActiveSubscriptionCreatedEvent,
  ) {
    return this.service.createOrUpdateBenefits(
      data.subscription.id,
      data.benefits ?? [],
    );
  }

  @OnEvent('active-subscription.updated', { async: true, promisify: true })
  async handleActiveSubscriptionUpdatedEvent(
    data: ActiveSubscriptionCreatedEvent,
  ) {
    return this.service.createOrUpdateBenefits(
      data.subscription.id,
      data.benefits ?? [],
    );
  }
}
