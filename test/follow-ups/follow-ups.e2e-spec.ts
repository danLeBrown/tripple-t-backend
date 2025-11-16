import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { addDays, startOfDay } from 'date-fns';
import { getUnixTime } from 'date-fns/fp/getUnixTime';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { ClientsService } from '../../src/domains/clients/clients.service';
import { Client } from '../../src/domains/clients/entities/client.entity';
import { Lead } from '../../src/domains/leads/entities/lead.entity';
import { LeadsService } from '../../src/domains/leads/leads.service';
import { CreateFollowUpDtoOmitResource } from '../../src/domains/shared/follow-ups/dto/create-follow-up.dto';
import { FollowUp } from '../../src/domains/shared/follow-ups/entities/follow-up.entity';
import { FollowUpsService } from '../../src/domains/shared/follow-ups/follow-ups.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('FollowUpsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let admin: UserDto;
  let followUpsService: FollowUpsService;
  let leadsService: LeadsService;
  let clientsService: ClientsService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    followUpsService = app.get(FollowUpsService);
    leadsService = app.get(LeadsService);
    clientsService = app.get(ClientsService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create follow-ups (leads)', () => {
    let req: CreateFollowUpDtoOmitResource;
    let lead: Lead;

    beforeAll(async () => {
      lead = await leadsService.create({
        admin_user_id: admin.id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        company_name: faker.company.name(),
        source: 'website',
      });

      req = {
        user_id: admin.id,
        follow_up_at: getUnixTime(addDays(new Date(), 2)),
      };
    });

    afterAll(async () => {
      const followUps = await followUpsService.findBy();
      expect(followUps).toHaveLength(1);
    });

    it('/ (POST)', (done) => {
      request
        .post(`/v1/follow-ups/leads/${lead.id}`, req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data.follow_up_at).toEqual(req.follow_up_at);
          expect(res.body.data.status).toEqual('Upcoming');
          expect(res.body.data.is_done).toEqual(false);

          return done();
        });
    });

    it('should not create a duplicate follow-up, but rather update it', (done) => {
      request
        .post(`/v1/follow-ups/leads/${lead.id}`, {
          ...req,
          follow_up_at: getUnixTime(Date.now() + 1000 * 60 * 60 * 2),
        })
        .expect(201, done);
    });
  });

  describe('it should create follow-ups (clients)', () => {
    let req: CreateFollowUpDtoOmitResource;
    let client: Client;

    beforeAll(async () => {
      client = await clientsService.create({
        admin_user_id: admin.id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
      });

      req = {
        user_id: admin.id,
        follow_up_at: getUnixTime(addDays(new Date(), 2)),
      };
    });

    afterAll(async () => {
      const followUps = await followUpsService.findBy();
      expect(followUps).toHaveLength(2);
    });

    it('/ (POST)', (done) => {
      request
        .post(`/v1/follow-ups/clients/${client.id}`, req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data.follow_up_at).toEqual(req.follow_up_at);
          expect(res.body.data.status).toEqual('Upcoming');
          expect(res.body.data.is_done).toEqual(false);

          return done();
        });
    });

    it('should not create a duplicate follow-up, but rather update it', (done) => {
      request
        .post(`/v1/follow-ups/clients/${client.id}`, {
          ...req,
          follow_up_at: getUnixTime(Date.now() + 1000 * 60 * 60 * 2),
        })
        .expect(201, done);
    });
  });

  describe('it should always update followup with new timestamp if it already exists', () => {
    let req: CreateFollowUpDtoOmitResource;
    let followUp: FollowUp;
    let client: Client;
    const nextFollowUpAt = getUnixTime(addDays(new Date(), 1));

    beforeAll(async () => {
      client = await clientsService.create({
        admin_user_id: admin.id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
      });

      req = {
        user_id: admin.id,
        follow_up_at: getUnixTime(Date.now() + 1000 * 60 * 60),
      };

      followUp = await followUpsService.createForClient(client.id, req);
    });

    it('should update the follow-up with a new timestamp', (done) => {
      request
        .post(`/v1/follow-ups/clients/${client.id}`, {
          ...req,
          follow_up_at: nextFollowUpAt,
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data.follow_up_at).toEqual(nextFollowUpAt);
          expect(res.body.data.status).toEqual('Upcoming');
          expect(res.body.data.is_done).toEqual(false);
          expect(res.body.data.id).toEqual(followUp.id);

          return done();
        });
    });
  });

  describe('it should retrieve follow-ups', () => {
    it('/ (GET)', (done) => {
      request
        .get('/v1/follow-ups')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);

          return done();
        });
    });
  });

  describe('it should reschedule a follow-up', () => {
    let followUp: FollowUp;

    beforeAll(async () => {
      const lead = await leadsService.create({
        admin_user_id: admin.id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        company_name: faker.company.name(),
        source: 'website',
      });

      followUp = await followUpsService.createForLead(lead.id, {
        user_id: admin.id,
        follow_up_at: getUnixTime(startOfDay(new Date())),
      });

      expect(followUp.status).toEqual('Due Today');
    });

    afterAll(async () => {
      followUp = await followUpsService.findOneByOrFail({ id: followUp.id });

      expect(followUp.status).toEqual('Upcoming');
    });

    it('/:id/reschedule (PATCH)', (done) => {
      request
        .patch(`/v1/follow-ups/${followUp.id}/reschedule`, {
          follow_up_at: getUnixTime(addDays(new Date(), 1)),
        })
        .expect(200, done);
    });
  });

  describe('it should mark a follow-up as done', () => {
    let followUp: FollowUp;

    beforeAll(async () => {
      const lead = await leadsService.create({
        admin_user_id: admin.id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        company_name: faker.company.name(),
        source: 'website',
      });

      followUp = await followUpsService.createForLead(lead.id, {
        user_id: admin.id,
        follow_up_at: getUnixTime(startOfDay(new Date())),
      });

      expect(followUp.status).toEqual('Due Today');
    });

    afterAll(async () => {
      followUp = await followUpsService.findOneByOrFail({ id: followUp.id });

      expect(followUp.is_done).toEqual(true);
      expect(followUp.status).toEqual('Complete');
    });

    it('/:id/done (PATCH)', (done) => {
      request.patch(`/v1/follow-ups/${followUp.id}/done`, {}).expect(200, done);
    });
  });
});
