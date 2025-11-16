import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { AppConfigService } from '@/app-configs/app-config.service';
import {
  createActiveSubscriptionFromC9JA,
  createClientFromC9JA,
  createClubMemberFromC9JA,
} from '@/domains/clients/helpers/import-from-c9ja';
import { IImportClientFromC9JA } from '@/task-scheduler/interfaces/import-client';

import { ClientsService } from './clients.service';
import { ActiveSubscriptionsService } from './club-members/active-subscription/active-subscriptions.service';
import { ActiveSubscription } from './club-members/active-subscription/entities/active-subscription.entity';
import { ClubMembersService } from './club-members/club-members.service';
import { ClubMember } from './club-members/entities/club-member.entity';
import { Client } from './entities/client.entity';

@Injectable()
export class ImportClientsService {
  private readonly logger = new Logger(ImportClientsService.name);

  constructor(
    private httpService: HttpService,
    private configService: AppConfigService,
    private clientsService: ClientsService,
    private clubMembersService: ClubMembersService,
    private activeSubscriptionsService: ActiveSubscriptionsService,
  ) {}

  private async checkIfClientExists(clientData: IImportClientFromC9JA) {
    const { is_existing: clientExists, client } =
      await this.clientsService.createOrUpdate(
        createClientFromC9JA(clientData),
      );

    if (clientExists) {
      this.logger.log(`Client already exists: ${client.id}`);

      return client;
    }

    this.logger.log(`Client created: ${client.id}`);

    return client;
  }

  private async checkIfClubMemberExists(
    client: Client,
    clubConnectProfile: NonNullable<
      IImportClientFromC9JA['club_connect_profile']
    >,
  ) {
    const { is_existing: clubMemberExists, club_member } =
      await this.clubMembersService.createOrUpdate(
        createClubMemberFromC9JA(client.id, clubConnectProfile),
      );

    if (clubMemberExists) {
      this.logger.log(`Club member already exists: ${club_member.id}`);
      return club_member;
    }

    this.logger.log(`Club member created: ${club_member.id}`);
    return club_member;
  }

  private async checkIfActiveSubscriptionExists(
    client: Client,
    activeSubscription: NonNullable<
      IImportClientFromC9JA['active_subscription']
    >,
  ) {
    const { is_existing: activeSubscriptionExists, active_subscription } =
      await this.activeSubscriptionsService.createOrUpdate(
        createActiveSubscriptionFromC9JA(client.id, activeSubscription),
      );

    if (activeSubscriptionExists) {
      this.logger.log(
        `Active subscription already exists: ${active_subscription.id}`,
      );
      return active_subscription;
    }

    this.logger.log(`Active subscription created: ${active_subscription.id}`);
    return active_subscription;
  }

  async importClient(clientData: IImportClientFromC9JA) {
    const client = await this.checkIfClientExists(clientData);

    if (!clientData.active_subscription && !clientData.club_connect_profile) {
      this.logger.warn(
        `No active subscription or club connect profile for client: ${client.id}`,
      );
      return { client };
    }

    let activeSubscription: ActiveSubscription | null = null;

    if (clientData.active_subscription) {
      this.logger.log(`Importing active subscription for client: ${client.id}`);

      activeSubscription = await this.checkIfActiveSubscriptionExists(
        client,
        clientData.active_subscription,
      );
    }

    let clubMember: ClubMember | null = null;

    if (clientData.club_connect_profile) {
      this.logger.log(
        `Importing club connect profile for client: ${client.id}`,
      );

      clubMember = await this.checkIfClubMemberExists(
        client,
        clientData.club_connect_profile,
      );
    }

    this.logger.log(
      `Client ${client.id} with club member ${clubMember?.id} and active subscription ${activeSubscription?.id} imported successfully`,
    );

    return { client, activeSubscription, clubMember };
  }
}
