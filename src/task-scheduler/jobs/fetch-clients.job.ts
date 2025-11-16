import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { catchError, firstValueFrom, map } from 'rxjs';

import { AppConfigService } from '@/app-configs/app-config.service';
import { ImportClientsService } from '@/domains/clients/import-client.service';
import { IImportClientFromC9JA } from '@/task-scheduler/interfaces/import-client';

@Injectable()
export class FetchClientsJob {
  private readonly logger = new Logger(FetchClientsJob.name);

  private C9JA_BASE_URL: string;
  private C9JA_CLIENT_ID: string;
  private C9JA_CLIENT_SECRET: string;

  constructor(
    private httpService: HttpService,
    private configService: AppConfigService,
    private importClientsService: ImportClientsService,
  ) {
    this.C9JA_BASE_URL = this.configService.get<string>('C9JA_BASE_URL');
    this.C9JA_CLIENT_ID = this.configService.get<string>('C9JA_CLIENT_ID');
    this.C9JA_CLIENT_SECRET =
      this.configService.get<string>('C9JA_CLIENT_SECRET');
  }

  @Cron(CronExpression.EVERY_30_MINUTES, {
    // name: 'fetch-clients',
    // timeZone: 'UTC',
    // skip: isDisabled,
  })
  async handleCron() {
    this.logger.log('Fetching clients from Connect Nigeria...');

    const accessToken = await this.getAccessToken();

    const { data } = await firstValueFrom(
      this.httpService
        .get<{ data: IImportClientFromC9JA[] }>(
          `${this.C9JA_BASE_URL}/api/v1/club-connect/generic/external/crm/users`,
          {
            headers: {
              // eslint-disable-next-line quote-props
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            params: {
              include:
                'clubConnectUserProfile,activeClubConnectSubscription.clubConnectSubscriptionPlan',
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            this.logger.error('Error fetching clients:', error);
            throw new BadRequestException('Failed to fetch clients');
          }),
        ),
    );

    this.logger.log('Clients fetched successfully', JSON.stringify(data));

    const exe = await Promise.all(
      data.map(async (clientData, index) => {
        if (index !== 0 && index % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // to avoid overwhelming the server
        }

        try {
          return await this.importClient(clientData);
        } catch (error) {
          this.logger.error('Error importing client from C9JA:', error);
          return null;
        }
      }),
    );

    return exe;
  }

  private async getAccessToken(): Promise<string> {
    const req = {
      grant_type: 'client_credentials',
      client_id: this.C9JA_CLIENT_ID,
      client_secret: this.C9JA_CLIENT_SECRET,
      scope: 'get-club-users',
    };

    const exe = await firstValueFrom(
      this.httpService
        .post<{
          access_token: string;
          token_type: string;
          expires_in: number;
        }>(`${this.C9JA_BASE_URL}/oauth/token`, req, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            console.error('Error fetching access token:', error);
            throw new BadRequestException('Failed to fetch access token');
          }),
        ),
    );

    this.logger.log('Access token fetched successfully');

    return exe.access_token;
  }

  async importClient(clientData: IImportClientFromC9JA) {
    return this.importClientsService.importClient(clientData);
  }
}
