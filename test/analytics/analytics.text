import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { AnalyticsService } from '../../src/domains/analytics/analytics.service';
import { ActivityAnalyticsDto } from '../../src/domains/analytics/dto/activity-analytics.dto';
import { LeadAnalyticsDto } from '../../src/domains/analytics/dto/lead-analytics.dto';
import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { UsersService } from '../../src/domains/auth/users/users.service';
import { ClientsService } from '../../src/domains/clients/clients.service';
import { ClubMembersService } from '../../src/domains/clients/club-members/club-members.service';
import { LeadsService } from '../../src/domains/leads/leads.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('AnalyticsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let admin: UserDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should be able to get lead analytics', () => {
    beforeAll(async () => {
      const leadsService = app.get(LeadsService);

      // Create some test leads for analytics
      await Promise.all([
        leadsService.create({
          first_name: 'John',
          last_name: 'Doe',
          email: faker.internet.email(),
          phone_number: faker.phone.number(),
          status: 'new',
          admin_user_id: admin.id,
          company_name: faker.company.name(),
          source: 'website',
        }),
        leadsService.create({
          first_name: 'Jane',
          last_name: 'Smith',
          email: faker.internet.email(),
          phone_number: faker.phone.number(),
          status: 'contacted',
          admin_user_id: admin.id,
          company_name: faker.company.name(),
          source: 'referral',
        }),
      ]);
    });

    it('GET /v1/analytics/leads', (done) => {
      request
        .get('/v1/analytics/leads')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).toHaveProperty('data');
          const data = res.body.data as LeadAnalyticsDto;
          expect(data).toHaveProperty('total_leads', 2);
          expect(data).toHaveProperty('total_leads_this_month', 2);
          expect(data).toHaveProperty('group_by_status', {
            new: 1,
            contacted: 1,
          });

          return done();
        });
    });
  });

  describe('it should be able to get client analytics', () => {
    beforeAll(async () => {
      const clientsService = app.get(ClientsService);

      // Create some test clients for analytics
      await Promise.all([
        clientsService.create({
          first_name: 'Alice',
          last_name: 'Johnson',
          email: faker.internet.email(),
          phone_number: faker.phone.number(),
          status: 'active',
          admin_user_id: admin.id,
        }),
        clientsService.create({
          first_name: 'Bob',
          last_name: 'Williams',
          email: faker.internet.email(),
          phone_number: faker.phone.number(),
          status: 'inactive',
          admin_user_id: admin.id,
        }),
      ]);
    });

    it('GET /v1/analytics/clients', (done) => {
      request
        .get('/v1/analytics/clients')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('total_clients', 2);
          expect(res.body.data).toHaveProperty('total_clients_this_month', 2);
          expect(res.body.data).toHaveProperty('group_by_status', {
            active: 1,
            inactive: 1,
          });

          return done();
        });
    });
  });

  describe('it should be able to get club member analytics', () => {
    beforeAll(async () => {
      const clientsService = app.get(ClientsService);
      const clubMembersService = app.get(ClubMembersService);

      const [c1, c2] = await Promise.all([
        clientsService.create({
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          phone_number: faker.phone.number(),
          admin_user_id: admin.id,
        }),
        clientsService.create({
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          phone_number: faker.phone.number(),
          admin_user_id: admin.id,
        }),
      ]);

      // Create some test club members for analytics
      await Promise.all([
        clubMembersService.create({
          client_id: c1.id,
          company_name: faker.company.name(),
          company_address: faker.location.streetAddress(),
          job_role: faker.person.jobTitle(),
          team_size: faker.number.int({ min: 1, max: 100 }).toString(),
          services: faker.commerce.productAdjective(),
          organization_type: faker.commerce.department(),
        }),
        clubMembersService.create({
          client_id: c2.id,
          company_name: faker.company.name(),
          company_address: faker.location.streetAddress(),
          job_role: faker.person.jobTitle(),
          team_size: faker.number.int({ min: 1, max: 100 }).toString(),
          services: faker.commerce.productAdjective(),
          organization_type: faker.commerce.department(),
          status: 'inactive',
        }),
      ]);
    });

    it('GET /v1/analytics/club-members', (done) => {
      request
        .get('/v1/analytics/club-members')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('total_club_members', 2);
          expect(res.body.data).toHaveProperty(
            'total_club_members_this_month',
            2,
          );
          expect(res.body.data).toHaveProperty('group_by_status', {
            active: 1,
            inactive: 1,
          });

          return done();
        });
    });
  });

  describe('it should be able to get activity analytics', () => {
    beforeAll(async () => {
      const newAdmin = await app.get(UsersService).create({
        first_name: 'Admin',
        last_name: 'User',
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        password: 'TestPassword123',
        is_admin: true,
      });

      const leadsService = app.get(LeadsService);
      const lead = await leadsService.create({
        first_name: 'Eve',
        last_name: 'Adams',
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        status: 'new',
        admin_user_id: admin.id,
        company_name: faker.company.name(),
        source: 'website',
      });

      const clientsService = app.get(ClientsService);
      const client = await clientsService.create({
        first_name: 'Frank',
        last_name: 'Castle',
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        status: 'active',
        admin_user_id: admin.id,
      });

      const clubMembersService = app.get(ClubMembersService);
      const clubMember = await clubMembersService.create({
        client_id: client.id,
        company_name: faker.company.name(),
        company_address: faker.location.streetAddress(),
        job_role: faker.person.jobTitle(),
        organization_type: faker.commerce.department(),
        services: faker.commerce.productAdjective(),
        team_size: faker.number.int({ min: 1, max: 100 }).toString(),
        status: 'active',
      });

      // Create some test activities for analytics
      await Promise.all([
        leadsService.createActivities(lead.id, [
          {
            type: 'call',
            description: 'Follow-up call with lead',
            admin_user_id: admin.id,
          },
          {
            type: 'email',
            description: 'Sent welcome email to lead',
            admin_user_id: admin.id,
          },
        ]),
        clientsService.createActivities(client.id, [
          {
            type: 'call',
            description: 'Follow-up call with client',
            admin_user_id: admin.id,
          },
          {
            type: 'email',
            description: 'Sent invoice to client',
            admin_user_id: admin.id,
          },
        ]),
        clubMembersService.createActivities(clubMember.id, [
          {
            type: 'call',
            description: 'Follow-up call with club member',
            admin_user_id: admin.id,
          },
          {
            type: 'email',
            description: 'Sent membership renewal email',
            admin_user_id: admin.id,
          },
          {
            type: 'meeting',
            description: 'In-person meeting with club member',
            admin_user_id: newAdmin.id,
          },
        ]),
      ]);
    });

    it('GET /v1/analytics/activities', (done) => {
      request
        .get('/v1/analytics/activities')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('total_activities', 7);
          expect(res.body.data).toHaveProperty('today_activities', {
            total: 7,
            group_by_type: {
              call: 3,
              email: 3,
              meeting: 1,
            },
          } satisfies ActivityAnalyticsDto['today_activities']);
          expect(res.body.data).toHaveProperty('team_activity_leaderboard', {
            this_week: {
              total: 7,
              group_by_user: [
                {
                  name: 'Club Connect',
                  total: 6,
                },
                {
                  name: 'Admin User',
                  total: 1,
                },
              ],
            },
            today: {
              total: 7,
              group_by_user: [
                {
                  name: 'Club Connect',
                  total: 6,
                },
                {
                  name: 'Admin User',
                  total: 1,
                },
              ],
            },
          } satisfies ActivityAnalyticsDto['team_activity_leaderboard']);
          expect(res.body.data).toHaveProperty('recent_activities');
          expect(res.body.data.recent_activities).toBeInstanceOf(Array);
          expect(res.body.data.recent_activities.length).toBeLessThanOrEqual(
            AnalyticsService.RECENT_ACTIVITIES_LIMIT,
          );

          return done();
        });
    });
  });

  describe('it should be able to get performance summary analytics', () => {
    it('GET /v1/analytics/performance-summary', (done) => {
      request
        .get('/v1/analytics/performance-summary')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('conversion_rate');
          expect(res.body.data).toHaveProperty('total_clients');
          expect(res.body.data).toHaveProperty('total_club_members');
          expect(res.body.data).toHaveProperty('total_revenue');

          return done();
        });
    });
  });

  describe('it should be able to get trends analytics', () => {
    it('GET /v1/analytics/trends', (done) => {
      request
        .get('/v1/analytics/trends')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          res.body.data.forEach((trend) => {
            expect(trend).toHaveProperty('name');
            expect(trend).toHaveProperty('data');
          });

          return done();
        });
    });
  });

  describe('it should be able to get team performance analytics', () => {
    it('GET /v1/analytics/team-performance', (done) => {
      request
        .get('/v1/analytics/team-performance')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          res.body.data.forEach((member) => {
            expect(member).toHaveProperty('full_name');
            expect(member).toHaveProperty('role');
            expect(member).toHaveProperty('total_revenue');
            expect(member).toHaveProperty('total_clients');
            expect(member).toHaveProperty('conversion_rate');
          });

          return done();
        });
    });
  });
});
