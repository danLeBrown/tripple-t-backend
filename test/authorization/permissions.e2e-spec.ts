import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { CreatePermissionDto } from '../../src/domains/auth/authorization/dto/create-permission.dto';
import { Permission } from '../../src/domains/auth/authorization/entities/permission.entity';
import { PermissionsService } from '../../src/domains/auth/authorization/permissions.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('PermissionsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let permissionsService: PermissionsService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    permissionsService = app.get(PermissionsService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create a new permission', () => {
    const dto: CreatePermissionDto = {
      subject: 'permission',
      action: 'create',
      description: 'This permission allows creating permissions.',
    };

    it('POST /v1/authorization/permissions', (done) => {
      request
        .post('/v1/authorization/permissions', dto)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.subject).toBe(dto.subject);
          expect(res.body.data.action).toBe(dto.action);

          return done();
        });
    });

    it('POST /v1/authorization/permissions (error if permission already exists)', (done) => {
      request.post('/v1/authorization/permissions', dto).expect(400, done);
    });
  });

  describe('it should get all permissions', () => {
    it('GET /v1/authorization/permissions', (done) => {
      request
        .get('/v1/authorization/permissions')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);

          return done();
        });
    });
  });

  describe('it should get a permission by ID', () => {
    let permissionId: string;

    beforeAll(async () => {
      const permissions = await permissionsService.findBy();
      permissionId = permissions[0].id;
    });

    it('GET /v1/authorization/permissions/:id', (done) => {
      request
        .get(`/v1/authorization/permissions/${permissionId}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toHaveProperty('id', permissionId);
          return done();
        });
    });

    it('GET /v1/authorization/permissions/:id (error if permission not found)', (done) => {
      request
        .get(`/v1/authorization/permissions/${faker.string.uuid()}`)
        .expect(404, done);
    });
  });

  describe('it should update a permission', () => {
    let permission: Permission;
    let permissionToUpdate: Permission;

    beforeAll(async () => {
      permission = await permissionsService.create({
        subject: 'client',
        action: 'create',
        description: 'This permission allows creating clients.',
      });

      permissionToUpdate = await permissionsService.create({
        subject: 'permission',
        action: 'update',
        description: 'This permission allows updating permissions.',
      });
    });

    it('PATCH /v1/authorization/permissions/:id', (done) => {
      const updateDto = { subject: 'lead', action: 'create' };

      request
        .patch(`/v1/authorization/permissions/${permission.id}`, updateDto)
        .expect(200, done);
    });

    it('PATCH /v1/authorization/permissions/:id (error if permission not found)', (done) => {
      request
        .patch(`/v1/authorization/permissions/${faker.string.uuid()}`, {
          subject: 'permission',
        })
        .expect(404, done);
    });

    it('PATCH /v1/authorization/permissions/:id (error if slug already exists)', (done) => {
      request
        .patch(`/v1/authorization/permissions/${permission.id}`, {
          subject: permissionToUpdate.subject,
          action: permissionToUpdate.action,
        })
        .expect(400, done);
    });
  });

  describe('it should delete a permission', () => {
    let permission: Permission;

    beforeAll(async () => {
      permission = await permissionsService.create({
        subject: 'permission',
        action: 'delete',
        description: 'This permission allows deleting permissions.',
      });
    });

    it('DELETE /v1/authorization/permissions/:id', (done) => {
      request
        .delete(`/v1/authorization/permissions/${permission.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.message).toBe('Permission deleted');
          return done();
        });
    });

    it('DELETE /v1/authorization/permissions/:id (error if permission not found)', (done) => {
      request
        .delete(`/v1/authorization/permissions/${faker.string.uuid()}`)
        .expect(404, done);
    });
  });
});
