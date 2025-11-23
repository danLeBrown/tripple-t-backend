import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { CreateLeadDto } from '../../src/domains/leads/dto/create-lead.dto';
import { LeadDto } from '../../src/domains/leads/dto/lead.dto';
import { UpdateLeadDto } from '../../src/domains/leads/dto/update-lead.dto';
import { LeadsService } from '../../src/domains/leads/leads.service';
import { CreateActivityWithoutResourceDto } from '../../src/domains/shared/activities/dto/create-activity.dto';
import { CreateTagWithoutResourceDto } from '../../src/domains/shared/tags/dto/create-tag.dto';
import { CreateUploadDto } from '../../src/domains/uploads/dto/create-upload.dto';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('LeadsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let admin: UserDto;
  let leadsService: LeadsService;
  let lead: LeadDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    leadsService = app.get(LeadsService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it('/ (GET)', (done) => {
    request.get('/v1/leads').expect(200, done);
  });

  describe('it should create a lead', () => {
    afterAll(async () => {
      const l = await leadsService.findOneBy({
        id: lead.id,
      });

      expect(l).not.toBeNull();
    });

    it('/ (POST)', (done) => {
      const req = {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        admin_user_id: admin.id,
        source: 'website',
        company_name: faker.company.name(),
      } satisfies CreateLeadDto;

      request
        .post('/v1/leads', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.first_name).toEqual(req.first_name);
          lead = res.body.data;

          return done();
        });
    });

    it('should throw an error if lead already exists', (done) => {
      const req = {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: lead.email,
        phone_number: lead.phone_number,
        admin_user_id: admin.id,
        source: 'website',
        company_name: faker.company.name(),
      } satisfies CreateLeadDto;

      request.post('/v1/leads', req).expect(400, done);
    });
  });

  describe('it should retrieve leads', () => {
    beforeAll(async () => {
      await leadsService.create({
        first_name: 'John',
        last_name: 'Doe',
        email: 'johndoe@example.com',
        phone_number: faker.phone.number(),
        admin_user_id: admin.id,
        source: 'website',
        company_name: faker.company.name(),
      });
    });

    it('/ (GET)', (done) => {
      request
        .get('/v1/leads')
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
        .get('/v1/leads/search?query=john')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].first_name).toEqual('John');

          return done();
        });
    });

    it('/leads?limit=1&page=1 (GET)', (done) => {
      request
        .get('/v1/leads?limit=1&page=1')
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
  });

  describe('it should retrieve a lead by id', () => {
    it('/:id (GET)', (done) => {
      request
        .get(`/v1/leads/${lead.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(lead.id);
          expect(res.body.data.first_name).toBe(lead.first_name);
          expect(res.body.data.last_name).toBe(lead.last_name);
          expect(res.body.data.email).toBe(lead.email);
          expect(res.body.data.phone_number).toBe(lead.phone_number);

          return done();
        });
    });

    it('/:id (GET) should throw an error if lead does not exist', (done) => {
      request.get(`/v1/leads/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should group leads by status', () => {
    it('/group-by-status (GET)', (done) => {
      request
        .get('/v1/leads/group-by-status')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0]).toHaveProperty('status');
          expect(res.body.data[0]).toHaveProperty('count');
          expect(res.body.data[0].status).toBeDefined();
          expect(res.body.data[0].count).toBeDefined();

          return done();
        });
    });
  });

  describe('it should update a lead', () => {
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
    });

    afterAll(async () => {
      await leadsService.findOneByOrFail({ id: lead.id });
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        first_name: faker.person.firstName(),
      } satisfies UpdateLeadDto;

      request.patch(`/v1/leads/${lead.id}`, req).expect(200, done);
    });

    it('/:id (PATCH) should throw an error if lead does not exist', (done) => {
      const req = {
        first_name: faker.person.firstName(),
      } satisfies UpdateLeadDto;

      request.patch(`/v1/leads/${faker.string.uuid()}`, req).expect(404, done);
    });

    describe('it should throw an error if you try to update a lead with an existing email or phone number', () => {
      let new_lead_id: string;

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

        new_lead_id = l.id;
      });

      it('should throw an error if you try to update a lead with an existing email or phone number', (done) => {
        const req = {
          first_name: faker.person.firstName(),
          email: lead.email,
          phone_number: lead.phone_number,
        } satisfies UpdateLeadDto;
        request.patch(`/v1/leads/${new_lead_id}`, req).expect(400, done);
      });
    });
  });

  describe('it should create lead tags', () => {
    afterAll(async () => {
      const l = await leadsService.findOneByOrFail({ id: lead.id });
      expect(l.tags).toBeDefined();
      expect(l.tags?.length).toEqual(3);
    });

    it('/:id/tags (POST) it should throw an error if payload is invalid', (done) => {
      const req = {
        foo: 'bar',
      };

      request
        .post(`/v1/leads/${faker.string.uuid()}/tags`, req)
        .expect(400, done);
    });

    it('/:id/tags (POST) it should throw an error if lead does not exist', (done) => {
      const req = [
        {
          value: 'Software Development',
        },
      ] satisfies CreateTagWithoutResourceDto[];

      request
        .post(`/v1/leads/${faker.string.uuid()}/tags`, req)
        .expect(404, done);
    });

    it('/:id/tags (POST)', (done) => {
      const req = [
        {
          value: 'Software Development',
        },
        {
          value: 'Web Development',
        },
        {
          value: 'Mobile Development',
        },
      ] satisfies CreateTagWithoutResourceDto[];

      request
        .post(`/v1/leads/${lead.id}/tags`, req)
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

  describe('it should create lead activities', () => {
    afterAll(async () => {
      const l = await leadsService.findOneByOrFail({ id: lead.id });
      expect(l.activities).toBeDefined();
      expect(l.activities?.length).toEqual(3);
    });

    it('/:id/activities (POST) it should throw an error if payload is invalid', (done) => {
      const req = {
        foo: 'bar',
      };

      request
        .post(`/v1/leads/${faker.string.uuid()}/activities`, req)
        .expect(400, done);
    });

    it('/:id/activities (POST) it should throw an error if lead does not exist', (done) => {
      const req = [
        {
          type: 'call',
          description: 'Called the lead to discuss project requirements.',
          admin_user_id: admin.id,
        },
      ] satisfies CreateActivityWithoutResourceDto[];

      request
        .post(`/v1/leads/${faker.string.uuid()}/activities`, req)
        .expect(404, done);
    });

    it('/:id/activities (POST)', (done) => {
      const req = [
        {
          type: 'call',
          description: 'Called the lead to discuss project requirements.',
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
        .post(`/v1/leads/${lead.id}/activities`, req)
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

  describe('it should upload lead documents', () => {
    it('/:id/documents (POST) it should throw an error if lead does not exist', (done) => {
      request
        .post(`/v1/leads/${faker.string.uuid()}/documents`, [
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

      request.post(`/v1/leads/${lead.id}/documents`, req).expect(400, done);
    });

    it('/:id/documents (POST)', (done) => {
      request
        .post(`/v1/leads/${lead.id}/documents`, [
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
        .get(`/v1/leads/${lead.id}`)
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

  describe('it should delete a lead document', () => {
    let documentId: string;

    beforeAll(async () => {
      const l = await leadsService.findOneByOrFail({ id: lead.id });
      documentId = l.documents?.at(0)?.id ?? '';
    });

    it('/:id/documents/:document_id (DELETE)', (done) => {
      request
        .delete(`/v1/leads/${lead.id}/documents/${documentId}`)
        .expect(200, done);
    });

    it('/:id (GET) should not contain the deleted document', (done) => {
      request
        .get(`/v1/leads/${lead.id}`)
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
