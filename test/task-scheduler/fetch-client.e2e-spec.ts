import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { ClientsService } from '../../src/domains/clients/clients.service';
import { ActiveSubscriptionsService } from '../../src/domains/clients/club-members/active-subscription/active-subscriptions.service';
import { ClubMembersService } from '../../src/domains/clients/club-members/club-members.service';
import { FetchClientsJob } from '../../src/task-scheduler/jobs/fetch-clients.job';
import { c9jaData } from '../mock/c9ja-client-data';
import { setupApplication } from '../setup/app';

describe('FetchClients (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let clientsService: ClientsService;
  let clubMembershipsService: ClubMembersService;
  let activeSubscriptionsService: ActiveSubscriptionsService;
  let fetchClient: FetchClientsJob;
  let numberOfClients = 0;
  let numberOfClubMembers = 0;
  let numberOfActiveSubscriptions = 0;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    // const csrf = await getCsrfToken(app);
    // const loginResponse = await loginAdmin(app, csrf);
    // request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    // admin = loginResponse.user;

    clientsService = app.get(ClientsService);
    fetchClient = app.get(FetchClientsJob);
    clubMembershipsService = app.get(ClubMembersService);
    activeSubscriptionsService = app.get(ActiveSubscriptionsService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create clients from the C9JA API', () => {
    beforeAll(async () => {
      const exe = c9jaData.map((data) => fetchClient.importClient(data));
      await Promise.all(exe);
    });

    it('should have created clients', async () => {
      const clients = await clientsService.findBy({});
      expect(clients.length).toBeGreaterThan(0);
      numberOfClients = clients.length;
    });

    it('should have create club members for clients', async () => {
      const clubMembers = await clubMembershipsService.findBy({});
      expect(clubMembers.length).toBeGreaterThan(0);
      numberOfClubMembers = clubMembers.length;
    });

    it('should have created active subscriptions for club members', async () => {
      const activeSubscriptions = await activeSubscriptionsService.findBy({});
      expect(activeSubscriptions.length).toBeGreaterThan(0);
      numberOfActiveSubscriptions = activeSubscriptions.length;
    });
  });

  describe('it should not create duplicate clients', () => {
    beforeAll(async () => {
      const exe = c9jaData.map((data) => fetchClient.importClient(data));
      await Promise.all(exe);
    });

    it('should not create duplicate clients', async () => {
      const clients = await clientsService.findBy({});
      expect(clients.length).toBe(numberOfClients);
    });

    it('should not create duplicate club members', async () => {
      const clubMembers = await clubMembershipsService.findBy({});
      expect(clubMembers.length).toBe(numberOfClubMembers);
    });

    it('should not create duplicate active subscriptions', async () => {
      const activeSubscriptions = await activeSubscriptionsService.findBy({});
      expect(activeSubscriptions.length).toBe(numberOfActiveSubscriptions);
    });
  });

  describe('should update existing clients, club members, or active subscriptions', () => {
    let clientId: string;

    const dataToInsert = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@example.com',
      phone: '000000010',
      club_connect_profile: {
        user_id: 22001,
        company_name: 'ZSR Nigeria Limited',
        company_email: 'info@zsrng.com',
        company_phone: '2348159692122',
        job_designation: 'Director',
        headquarters_address:
          'KAF Mall, 130 Ikotun-Idimu Raod, Alake Bus Stop, Ikotun, Lagos',
        organization_type: 'Limited Liability Company by Shares',
        services:
          'Business Consulting, Technology Solutions, Digital Marketing',
        team_size: '1-100',
      },
      active_subscription: null,
    };

    const updatedData = {
      ...dataToInsert,
      first_name: 'Jane',
      last_name: 'Doe',
      active_subscription: {
        plan: {
          name: 'Single user Yearly membership plan',
          description: faker.lorem.sentence(10),
          price_in_ngn: '60000.00',
          duration_in_days: '365',
        },
        is_paused: false,
        is_terminated: false,
        paused_at: null,
        terminated_at: null,
        expired_at: '2025-08-20T14:46:06.000000Z',
        benefits: {
          featured_article: {
            used: 0,
            limit: 1,
          },
          featured_listing: {
            used: 0,
            limit: 1,
            duration_months: 3,
          },
          meet_boss_session: {
            used: 0,
            limit: 1,
          },
          mentoring_session: {
            used: 0,
            limit: 1,
          },
          advertising_discount: {
            limit: -1,
            percentage: 30,
          },
          bizmix_event_attendance: {
            used: 0,
            limit: 12,
          },
        },
      },
    };

    beforeAll(async () => {
      await fetchClient.importClient(dataToInsert);
    });

    it('should have created a new client and club member', async () => {
      const client = await clientsService.findOneByOrFail({
        email: dataToInsert.email,
      });
      expect(client.email).toBe(dataToInsert.email);
      clientId = client.id;

      expect(client.active_subscriptions).toHaveLength(0);

      await clubMembershipsService.findOneByOrFail({
        client_id: clientId,
      });
    });

    it('should update the client with new data', async () => {
      await fetchClient.importClient(updatedData);

      const client = await clientsService.findOneByOrFail({
        id: clientId,
      });

      expect(client.first_name).toBe(updatedData.first_name);
      expect(client.last_name).toBe(updatedData.last_name);
      expect(client.email).toBe(updatedData.email);

      expect(client.active_subscriptions).toHaveLength(1);

      await clubMembershipsService.findOneByOrFail({
        client_id: clientId,
      });
    });

    it('should update the benefits of the active subscription', async () => {
      await fetchClient.importClient({
        ...updatedData,
        active_subscription: {
          ...updatedData.active_subscription,
          benefits: {
            ...updatedData.active_subscription.benefits,
            featured_article: {
              used: 1,
              limit: 1,
            },
          },
        },
      });

      const client = await clientsService.findOneByOrFail({
        id: clientId,
      });

      const featured_article = client.active_subscriptions
        ?.at(0)
        ?.benefits?.find((b) => b.benefit_name === 'featured_article');
      expect(featured_article).toBeDefined();
      expect(featured_article?.used).toBe(1);
      expect(featured_article?.limit).toBe(1);
    });
  });
});
