import { CreateActiveSubscriptionDto } from '../dto/create-active-subscription.dto';
import { ActiveSubscription } from '../entities/active-subscription.entity';

export interface ActiveSubscriptionCreatedEvent {
  subscription: ActiveSubscription;
  benefits: CreateActiveSubscriptionDto['benefits'];
}
