import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { ClientsService } from '../../src/domains/clients/clients.service';
import { ClubMembersService } from '../../src/domains/clients/club-members/club-members.service';
import { ClubMemberDto } from '../../src/domains/clients/club-members/dto/club-member.dto';
import { CreateClubMemberDto } from '../../src/domains/clients/club-members/dto/create-club-member.dto';
import { UpdateClubMemberDto } from '../../src/domains/clients/club-members/dto/query-or-update-club-member.dto';
import { ClientDto } from '../../src/domains/clients/dto/client.dto';
import { CreateActivityWithoutResourceDto } from '../../src/domains/shared/activities/dto/create-activity.dto';
import { CreateUploadDto } from '../../src/domains/uploads/dto/create-upload.dto';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('ClubMembersController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let admin: UserDto;
  let clientsService: ClientsService;
  let clubMembersService: ClubMembersService;
  let clubMember: ClubMemberDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    clientsService = app.get(ClientsService);
    clubMembersService = app.get(ClubMembersService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it('/ (GET)', () => {
    request.get('/v1/club-members').expect(200);
  });

  describe('it should create a club member', () => {
    let client: ClientDto;

    beforeAll(async () => {
      const c = await clientsService.create({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        admin_user_id: admin.id,
      });

      client = c.toDto();
    });

    it('/ (POST', (done) => {
      const req = {
        client_id: client.id,
        company_name: 'ACME Corp',
        company_address: faker.location.streetAddress(),
        job_role: faker.person.jobTitle(),
        team_size: faker.number.int({ min: 1, max: 100 }).toString(),
        services: faker.commerce.productAdjective(),
        organization_type: faker.commerce.department(),
      } satisfies CreateClubMemberDto;

      request
        .post('/v1/club-members', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.client_id).toEqual(req.client_id);
          clubMember = res.body.data;

          return done();
        });
    });

    it('should throw an error if club member already exists', (done) => {
      const req: CreateClubMemberDto = {
        client_id: client.id,
        company_name: faker.company.name(),
        company_address: faker.location.streetAddress(),
        job_role: faker.person.jobTitle(),
        team_size: faker.number.int({ min: 1, max: 100 }).toString(),
        services: faker.commerce.productAdjective(),
        organization_type: faker.commerce.department(),
      };

      request.post('/v1/club-members', req).expect(400, done);
    });
  });

  describe('it should retrieve club members', () => {
    it('/ (GET)', (done) => {
      request
        .get('/v1/club-members')
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
        .get(`/v1/club-members/search?query=ACME`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].company_name).toEqual('ACME Corp');

          return done();
        });
    });

    it('/:id (GET)', (done) => {
      request.get(`/v1/club-members/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should update a club member', () => {
    let client: ClientDto;

    beforeAll(async () => {
      const c = await clientsService.create({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        admin_user_id: admin.id,
      });

      client = c.toDto();

      const cm = await clubMembersService.create({
        client_id: client.id,
        company_name: faker.company.name(),
        company_address: faker.location.streetAddress(),
        job_role: faker.person.jobTitle(),
        team_size: faker.number.int({ min: 1, max: 100 }).toString(),
        services: faker.commerce.productAdjective(),
        organization_type: faker.commerce.department(),
      });
      clubMember = cm.toDto();
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        status: 'inactive',
      } satisfies UpdateClubMemberDto;

      request.patch(`/v1/club-members/${clubMember.id}`, req).expect(200, done);
    });

    it('/:id (PATCH) should throw an error if club member does not exist', (done) => {
      const req = {
        status: 'inactive',
      } satisfies UpdateClubMemberDto;

      request
        .patch(`/v1/club-members/${faker.string.uuid()}`, req)
        .expect(404, done);
    });

    describe('it should throw an error if you try to update a club member with an existing lead_id', () => {
      let new_club_member_id: string;

      beforeAll(async () => {
        const c = await clientsService.create({
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          phone_number: faker.phone.number(),
          admin_user_id: admin.id,
        });

        const cm = await clubMembersService.create({
          client_id: c.id,
          company_name: faker.company.name(),
          company_address: faker.location.streetAddress(),
          job_role: faker.person.jobTitle(),
          team_size: faker.number.int({ min: 1, max: 100 }).toString(),
          services: faker.commerce.productAdjective(),
          organization_type: faker.commerce.department(),
        });

        new_club_member_id = cm.id;
      });

      it('should throw an error if you try to update a club member with an existing email or phone number', (done) => {
        const req = {
          client_id: client.id,
        } satisfies UpdateClubMemberDto;
        request
          .patch(`/v1/club-members/${new_club_member_id}`, req)
          .expect(400, done);
      });
    });
  });

  describe('it should create club member activities', () => {
    afterAll(async () => {
      const l = await clubMembersService.findOneByOrFail({ id: clubMember.id });
      expect(l.activities).toBeDefined();
      expect(l.activities?.length).toEqual(3);
    });

    it('/:id/activities (POST) it should throw an error if payload is invalid', (done) => {
      const req = {
        foo: 'bar',
      };

      request
        .post(`/v1/club-members/${faker.string.uuid()}/activities`, req)
        .expect(400, done);
    });

    it('/:id/activities (POST) it should throw an error if club member does not exist', (done) => {
      const req = [
        {
          type: 'call',
          description:
            'Called the club member to discuss project requirements.',
          admin_user_id: admin.id,
        },
      ] satisfies CreateActivityWithoutResourceDto[];

      request
        .post(`/v1/club-members/${faker.string.uuid()}/activities`, req)
        .expect(404, done);
    });

    it('/:id/activities (POST)', (done) => {
      const req = [
        {
          type: 'call',
          description:
            'Called the club member to discuss project requirements.',
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
        .post(`/v1/club-members/${clubMember.id}/activities`, req)
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

  describe('it should upload club member documents', () => {
    it('/:id/documents (POST) it should throw an error if club member does not exist', (done) => {
      request
        .post(`/v1/club-members/${faker.string.uuid()}/documents`, [
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

      request
        .post(`/v1/club-members/${clubMember.id}/documents`, req)
        .expect(400, done);
    });

    it('/:id/documents (POST)', (done) => {
      request
        .post(`/v1/club-members/${clubMember.id}/documents`, [
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
        .get(`/v1/club-members/${clubMember.id}`)
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

  describe('it should delete a club member document', () => {
    let documentId: string;

    beforeAll(async () => {
      const c = await clubMembersService.findOneByOrFail({ id: clubMember.id });
      documentId = c.documents?.at(0)?.id ?? '';
    });

    it('/:id/documents/:document_id (DELETE)', (done) => {
      request
        .delete(`/v1/club-members/${clubMember.id}/documents/${documentId}`)
        .expect(200, done);
    });

    it('/:id (GET) should not contain the deleted document', (done) => {
      request
        .get(`/v1/club-members/${clubMember.id}`)
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
