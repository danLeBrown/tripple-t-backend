import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import {
  CreateRoleDto,
  UpdateRoleDto,
} from '../../src/domains/auth/authorization/dto/create-role.dto';
import { CreateRolePermissionsDto } from '../../src/domains/auth/authorization/dto/create-role-permission.dto';
import { CreateUserRoleDto } from '../../src/domains/auth/authorization/dto/create-user-role.dto';
import { Role } from '../../src/domains/auth/authorization/entities/role.entity';
import { PermissionsService } from '../../src/domains/auth/authorization/permissions.service';
import { RolesService } from '../../src/domains/auth/authorization/roles.service';
import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { UsersService } from '../../src/domains/auth/users/users.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('RolesController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let admin: UserDto;
  let rolesService: RolesService;
  let permissionsService: PermissionsService;
  let usersService: UsersService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    rolesService = app.get(RolesService);
    permissionsService = app.get(PermissionsService);
    usersService = app.get(UsersService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create a role', () => {
    const createRoleDto: CreateRoleDto = {
      name: faker.person.jobTitle(),
      description: faker.lorem.sentence(),
    };
    it('POST /v1/roles', (done) => {
      request
        .post('/v1/authorization/roles', createRoleDto)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBeDefined();
          expect(res.body.data.description).toBeDefined();

          return done();
        });
    });

    it('POST /v1/roles (error if role already exists)', (done) => {
      request
        .post('/v1/authorization/roles', {
          name: createRoleDto.name,
          description: faker.lorem.sentence(),
        } satisfies CreateRoleDto)
        .expect(400, done);
    });
  });

  describe('it should assign permissions to a role', () => {
    let roleId: string;
    let permissionId: string;

    beforeAll(async () => {
      const role = await rolesService.create({
        name: faker.person.jobTitle(),
        description: faker.lorem.sentence(),
      } satisfies CreateRoleDto);

      roleId = role.id;

      const permission = await permissionsService.create({
        subject: 'client',
        action: 'read',
        description: 'This permission allows reading clients.',
      });

      permissionId = permission.id;
    });

    afterAll(async () => {
      const role = await rolesService.findOneByOrFail({ id: roleId });
      expect(role.permissions).toHaveLength(1);
      expect(role.permissions?.at(0)?.permission_id).toBe(permissionId);
    });

    it('POST /v1/authorization/roles/:id/permissions (error)', (done) => {
      request
        .post(`/v1/authorization/roles/${roleId}/permissions`, {
          permission_ids: ['some-fake-id'],
        } satisfies CreateRolePermissionsDto)
        .expect(422, done);
    });

    it('POST /v1/authorization/roles/:id/permissions (error)', (done) => {
      request
        .post(`/v1/authorization/roles/${roleId}/permissions`, {
          permission_ids: [faker.string.uuid()],
        } satisfies CreateRolePermissionsDto)
        .expect(400, done);
    });

    it('POST /v1/authorization/roles/:id/permissions', (done) => {
      request
        .post(`/v1/authorization/roles/${roleId}/permissions`, {
          permission_ids: [permissionId],
        } satisfies CreateRolePermissionsDto)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0]).toHaveProperty(
            'permission_id',
            permissionId,
          );

          return done();
        });
    });
  });

  describe('it should get permissions assigned to a role', () => {
    let roleId: string;
    let permissionId: string;

    beforeAll(async () => {
      const role = await rolesService.create({
        name: faker.person.jobTitle(),
        description: faker.lorem.sentence(),
      } satisfies CreateRoleDto);

      roleId = role.id;

      const permission = await permissionsService.create({
        subject: 'lead',
        action: 'read',
        description: 'This permission allows reading leads.',
      });

      permissionId = permission.id;

      await rolesService.assignPermissions(roleId, [permissionId]);
    });

    it('GET /v1/authorization/roles/:id/permissions', (done) => {
      request
        .get(`/v1/authorization/roles/${roleId}/permissions`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0]).toHaveProperty(
            'permission_id',
            permissionId,
          );

          return done();
        });
    });
  });

  describe('it should delete a role permission', () => {
    let roleId: string;
    let permissionId: string;

    beforeAll(async () => {
      const role = await rolesService.create({
        name: faker.person.jobTitle(),
        description: faker.lorem.sentence(),
      } satisfies CreateRoleDto);

      roleId = role.id;

      const permission = await permissionsService.create({
        subject: 'lead',
        action: 'export',
        description: 'This permission allows exporting leads.',
      });

      permissionId = permission.id;

      await rolesService.assignPermissions(roleId, [permissionId]);
    });

    afterAll(async () => {
      const role = await rolesService.findOneByOrFail({ id: roleId });
      expect(role.permissions).toHaveLength(0);
    });

    it('DELETE /v1/authorization/roles/:id/permissions (error if role does not exist)', (done) => {
      request
        .delete(`/v1/authorization/roles/${faker.string.uuid()}/permissions`, {
          permission_ids: [permissionId],
        } satisfies CreateRolePermissionsDto)
        .expect(404, done);
    });

    it('DELETE /v1/authorization/roles/:id/permissions (error if permission does not exist)', (done) => {
      request
        .delete(`/v1/authorization/roles/${roleId}/permissions`, {
          permission_ids: [faker.string.uuid()],
        } satisfies CreateRolePermissionsDto)
        .expect(400, done);
    });

    it('DELETE /v1/authorization/roles/:id/permissions', (done) => {
      request
        .delete(`/v1/authorization/roles/${roleId}/permissions`, {
          permission_ids: [permissionId],
        } satisfies CreateRolePermissionsDto)
        .expect(200, done);
    });
  });

  describe('it should get all roles', () => {
    it('GET /v1/authorization/roles', (done) => {
      request
        .get('/v1/authorization/roles')
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
  });

  describe('it should assign a role to a user', () => {
    let nonAdminUseId: string;
    let userId: string;
    let roleId: string;

    beforeAll(async () => {
      const newUser = await usersService.create({
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        phone_number: faker.phone.number(),
        password: faker.internet.password(),
        is_admin: true,
      });

      userId = newUser.id;

      const nonAdminUser = await usersService.create({
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        phone_number: faker.phone.number(),
        password: faker.internet.password(),
        is_admin: false,
      });

      nonAdminUseId = nonAdminUser.id;

      const role = await rolesService.create({
        name: faker.person.jobTitle(),
        description: faker.lorem.sentence(),
      } satisfies CreateRoleDto);

      roleId = role.id;

      await rolesService.assignUserRole({
        user_id: newUser.id,
        role_id: role.id,
      });
    });

    afterAll(async () => {
      const user = await usersService.findOneByOrFail({ id: userId });
      expect(user.user_role).toBeDefined();
      expect(user.user_role?.role_id).toBe(roleId);
    });

    it("POST /v1/authorization/roles/users (error if role doesn't exist)", (done) => {
      request
        .post('/v1/authorization/roles/users', {
          user_id: admin.id,
          role_id: faker.string.uuid(),
        } satisfies CreateUserRoleDto)
        .expect(404, done);
    });

    it("POST /v1/authorization/roles/users (error if user doesn't exist)", (done) => {
      request
        .post('/v1/authorization/roles/users', {
          user_id: faker.string.uuid(),
          role_id: roleId,
        } satisfies CreateUserRoleDto)
        .expect(404, done);
    });

    it.skip('POST /v1/authorization/roles/users (error if user already has a role)', (done) => {
      request
        .post('/v1/authorization/roles/users', {
          user_id: userId,
          role_id: roleId,
        } satisfies CreateUserRoleDto)
        .expect(400, done);
    });

    it('POST /v1/authorization/roles/users (error if user is not an admin)', (done) => {
      request
        .post('/v1/authorization/roles/users', {
          user_id: nonAdminUseId,
          role_id: roleId,
        } satisfies CreateUserRoleDto)
        .expect(400, done);
    });

    it('POST /v1/authorization/roles/users', (done) => {
      request
        .post('/v1/authorization/roles/users', {
          user_id: admin.id,
          role_id: roleId,
        } satisfies CreateUserRoleDto)
        .expect(201, done);
    });
  });

  describe('it should get users by role', () => {
    let roleId: string;
    let userId: string;

    beforeAll(async () => {
      const role = await rolesService.create({
        name: faker.person.jobTitle(),
        description: faker.lorem.sentence(),
      } satisfies CreateRoleDto);

      roleId = role.id;

      const newUser = await usersService.create({
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        phone_number: faker.phone.number(),
        password: faker.internet.password(),
        is_admin: true,
      });
      userId = newUser.id;

      await rolesService.assignUserRole({
        user_id: newUser.id,
        role_id: roleId,
      });
    });

    it('GET /v1/authorization/roles/:id/users', (done) => {
      request
        .get(`/v1/authorization/roles/${roleId}/users`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].user_id).toBe(userId);
          expect(res.body.data[0].role_id).toBe(roleId);

          return done();
        });
    });
  });

  describe('it should remove a role assigned to a user', () => {
    let userId: string;

    beforeAll(async () => {
      const newUser = await usersService.create({
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        phone_number: faker.phone.number(),
        password: faker.internet.password(),
        is_admin: true,
      });

      userId = newUser.id;

      const role = await rolesService.create({
        name: faker.person.jobTitle(),
        description: faker.lorem.sentence(),
      } satisfies CreateRoleDto);

      await rolesService.assignUserRole({
        user_id: userId,
        role_id: role.id,
      });
    });

    afterAll(async () => {
      const user = await usersService.findOneByOrFail({ id: userId });
      expect(user.user_role).toBeNull();
    });

    it('DELETE /v1/authorization/roles/users/:userId', (done) => {
      request
        .delete(`/v1/authorization/roles/users/${userId}`)
        .expect(200, done);
    });
  });

  describe('it should delete a role', () => {
    let roleId: string;

    beforeAll(async () => {
      const role = await rolesService.create({
        name: faker.person.jobTitle(),
        description: faker.lorem.sentence(),
      } satisfies CreateRoleDto);

      roleId = role.id;
    });

    it('DELETE /v1/authorization/roles/:id (error if role does not exist)', (done) => {
      request
        .delete(`/v1/authorization/roles/${faker.string.uuid()}`)
        .expect(404, done);
    });

    it('DELETE /v1/authorization/roles/:id', (done) => {
      request.delete(`/v1/authorization/roles/${roleId}`).expect(200, done);
    });
  });

  describe('it should update a role', () => {
    let role: Role;
    let roleToUpdate: Role;

    beforeAll(async () => {
      role = await rolesService.create({
        name: faker.person.jobTitle(),
        description: faker.lorem.sentence(),
      } satisfies CreateRoleDto);

      roleToUpdate = await rolesService.create({
        name: faker.person.jobTitle(),
        description: faker.lorem.sentence(),
      } satisfies CreateRoleDto);
    });

    it('PATCH /v1/authorization/roles/:id (error if role does not exist)', (done) => {
      request
        .patch(`/v1/authorization/roles/${faker.string.uuid()}`, {
          name: faker.person.jobTitle(),
        })
        .expect(404, done);
    });

    it('PATCH /v1/authorization/roles/:id (error if slug already exists)', (done) => {
      request
        .patch(`/v1/authorization/roles/${roleToUpdate.id}`, {
          name: role.name,
        })
        .expect(400, done);
    });

    it('PATCH /v1/authorization/roles/:id', (done) => {
      request
        .patch(`/v1/authorization/roles/${role.id}`, {
          name: faker.person.jobTitle(),
          description: faker.lorem.sentence(),
        } satisfies UpdateRoleDto)
        .expect(200, done);
    });
  });
});
