import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { ClientsService } from '../../src/domains/clients/clients.service';
import { ClientDto } from '../../src/domains/clients/dto/client.dto';
import { CreateClientDto } from '../../src/domains/clients/dto/create-client.dto';
import { UpdateClientDto } from '../../src/domains/clients/dto/update-client.dto';
import { LeadDto } from '../../src/domains/leads/dto/lead.dto';
import { LeadsService } from '../../src/domains/leads/leads.service';
import { CreateActivityWithoutResourceDto } from '../../src/domains/shared/activities/dto/create-activity.dto';
import { CreateUploadDto } from '../../src/domains/uploads/dto/create-upload.dto';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('ClientsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let admin: UserDto;
  let leadsService: LeadsService;
  let clientsService: ClientsService;
  let client: ClientDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    leadsService = app.get(LeadsService);
    clientsService = app.get(ClientsService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it('/ (GET)', () => {
    request.get('/v1/clients').expect(200);
  });

  describe('it should create a client', () => {
    let lead: LeadDto;

    beforeAll(async () => {
      const l = await leadsService.create({
        first_name: 'Jane',
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        company_name: faker.company.name(),
        phone_number: faker.phone.number(),
        admin_user_id: admin.id,
        source: 'website',
      });

      lead = l.toDto();
    });

    it('/ (POST', (done) => {
      const req = {
        lead_id: lead.id,
        admin_user_id: admin.id,
      } satisfies CreateClientDto;

      request
        .post('/v1/clients', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.lead_id).toEqual(req.lead_id);
          client = res.body.data;

          return done();
        });
    });

    it('should throw an error if client already exists', (done) => {
      const req: CreateClientDto = {
        lead_id: lead.id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        admin_user_id: admin.id,
      };

      request.post('/v1/clients', req).expect(400, done);
    });
  });

  describe('it should retrieve clients', () => {
    it('/ (GET)', (done) => {
      request
        .get('/v1/clients')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);

          return done();
        });
    });

    it('/search (GET)', (done) => {
      request
        .get(`/v1/clients/search?query=Jane`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].first_name).toEqual('Jane');

          return done();
        });
    });

    it('/clients?limit=1&page=1 (GET)', (done) => {
      request
        .get('/v1/clients?limit=1&page=1')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toEqual(1);

          return done();
        });
    });

    it('/:id (GET)', (done) => {
      request.get(`/v1/clients/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should update a client', () => {
    let lead: LeadDto;

    beforeAll(async () => {
      const l = await leadsService.create({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        admin_user_id: admin.id,
        source: 'website',
        company_name: faker.company.name(),
      });

      lead = l.toDto();

      const c = await clientsService.create({
        lead_id: lead.id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        admin_user_id: admin.id,
      });
      client = c.toDto();
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        status: 'inactive',
      } satisfies UpdateClientDto;

      request.patch(`/v1/clients/${client.id}`, req).expect(200, done);
    });

    it('/:id (PATCH) should throw an error if client does not exist', (done) => {
      const req = {
        status: 'inactive',
      } satisfies UpdateClientDto;

      request
        .patch(`/v1/clients/${faker.string.uuid()}`, req)
        .expect(404, done);
    });

    describe('it should throw an error if you try to update a client with an existing lead_id', () => {
      let new_client_id: string;

      beforeAll(async () => {
        const l = await leadsService.create({
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          phone_number: faker.phone.number(),
          admin_user_id: admin.id,
          source: 'website',
          company_name: faker.company.name(),
        });

        const c = await clientsService.create({
          lead_id: l.id,
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          phone_number: faker.phone.number(),
          admin_user_id: admin.id,
        });

        new_client_id = c.id;
      });

      it('should throw an error if you try to update a client with an existing email or phone number', (done) => {
        const req = {
          lead_id: client.lead_id ?? '',
        } satisfies UpdateClientDto;
        request.patch(`/v1/clients/${new_client_id}`, req).expect(400, done);
      });
    });
  });

  describe('it should create client activities', () => {
    afterAll(async () => {
      const l = await clientsService.findOneByOrFail({ id: client.id });
      expect(l.activities).toBeDefined();
      expect(l.activities?.length).toEqual(3);
    });

    it('/:id/activities (POST) it should throw an error if payload is invalid', (done) => {
      const req = {
        foo: 'bar',
      };

      request
        .post(`/v1/clients/${faker.string.uuid()}/activities`, req)
        .expect(400, done);
    });

    it('/:id/activities (POST) it should throw an error if client does not exist', (done) => {
      const req = [
        {
          type: 'call',
          description: 'Called the client to discuss project requirements.',
          admin_user_id: admin.id,
        },
      ] satisfies CreateActivityWithoutResourceDto[];

      request
        .post(`/v1/clients/${faker.string.uuid()}/activities`, req)
        .expect(404, done);
    });

    it('/:id/activities (POST)', (done) => {
      const req = [
        {
          type: 'call',
          description: 'Called the client to discuss project requirements.',
          admin_user_id: admin.id,
        },
        {
          type: 'email',
          description: 'Sent an email with project proposal.',
          admin_user_id: admin.id,
        },
        {
          type: 'meeting',
          description: 'Scheduled a meeting to discuss project details.',
          admin_user_id: admin.id,
        },
      ] satisfies CreateActivityWithoutResourceDto[];

      request
        .post(`/v1/clients/${client.id}/activities`, req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(3);

          return done();
        });
    });
  });

  describe('it should upload client documents', () => {
    it('/:id/documents (POST) it should throw an error if client does not exist', (done) => {
      request
        .post(`/v1/clients/${faker.string.uuid()}/documents`, [
          {
            name: 'test-document.pdf',
            relative_url: '2025/03/test-document.pdf',
          },
          {
            name: 'test-image.jpg',
            relative_url: '2025/03/test-image.jpg',
          },
        ] satisfies CreateUploadDto[])
        .expect(404, done);
    });

    it('/:id/documents (POST) it should throw an error if payload is invalid', (done) => {
      const req = {
        foo: 'bar',
      };

      request.post(`/v1/clients/${client.id}/documents`, req).expect(400, done);
    });

    it('/:id/documents (POST)', (done) => {
      request
        .post(`/v1/clients/${client.id}/documents`, [
          {
            name: 'test-document.pdf',
            relative_url: '2025/06/test-document.pdf',
          },
          {
            name: 'test-image.jpg',
            relative_url: '2025/06/test-image.jpg',
          },
        ] satisfies CreateUploadDto[])
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);

          return done();
        });
    });

    it('/:id (GET)', (done) => {
      request
        .get(`/v1/clients/${client.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.documents).toBeDefined();
          expect(res.body.data.documents.length).toEqual(2);

          return done();
        });
    });
  });

  describe('it should delete a client document', () => {
    let documentId: string;

    beforeAll(async () => {
      const c = await clientsService.findOneByOrFail({ id: client.id });
      documentId = c.documents?.at(0)?.id ?? '';
    });

    it('/:id/documents/:document_id (DELETE)', (done) => {
      request
        .delete(`/v1/clients/${client.id}/documents/${documentId}`)
        .expect(200, done);
    });

    it('/:id (GET) should not contain the deleted document', (done) => {
      request
        .get(`/v1/clients/${client.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.documents).toBeDefined();
          expect(res.body.data.documents.length).toEqual(1);

          return done();
        });
    });
  });
});
