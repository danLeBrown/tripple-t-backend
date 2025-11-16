import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LeadsModule } from '../leads/leads.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ActiveSubscriptionsService } from './club-members/active-subscription/active-subscriptions.service';
import { ActiveSubscription } from './club-members/active-subscription/entities/active-subscription.entity';
import { ActiveSubscriptionBenefit } from './club-members/active-subscription/entities/active-subscription-benefit.entity';
import { ActiveSubscriptionListener } from './club-members/active-subscription/listeners/active-subscription.listener';
import { ClubMembersController } from './club-members/club-members.controller';
import { ClubMembersService } from './club-members/club-members.service';
import { ClubMember } from './club-members/entities/club-member.entity';
import { Client } from './entities/client.entity';
import { ImportClientsService } from './import-client.service';
import { ClientsUpdatedListener } from './listeners/clients-updated.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      ClubMember,
      ActiveSubscription,
      ActiveSubscriptionBenefit,
    ]),
    LeadsModule,
  ],
  controllers: [ClientsController, ClubMembersController],
  providers: [
    ClientsService,
    ClubMembersService,
    ActiveSubscriptionsService,
    ActiveSubscriptionListener,
    ImportClientsService,
    ClientsUpdatedListener,
  ],
  exports: [
    ClientsService,
    ClubMembersService,
    ActiveSubscriptionsService,
    ImportClientsService,
  ],
})
export class ClientsModule {}
