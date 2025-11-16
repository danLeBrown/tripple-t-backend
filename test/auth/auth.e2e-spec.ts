import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AbstractStartedContainer } from 'testcontainers';

import { PermissionsService } from '../../src/domains/auth/authorization/permissions.service';
import { RolesService } from '../../src/domains/auth/authorization/roles.service';
import { User } from '../../src/domains/auth/users/entities/user.entity';
import { UsersService } from '../../src/domains/auth/users/users.service';
import { getCsrfToken, setupApplication } from '../setup/app';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let csrf: { token: string; session_id: string };
  let access_token: string;
  let refresh_token: string;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    csrf = await getCsrfToken(app);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should throw an error when you login with invalid credentials', () => {
    it('POST /v1/auth/login', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(),
        })
        .expect(400)
        .expect(
          {
            statusCode: 400,
            message: 'Invalid credentials',
            error: 'Bad Request',
          },
          done,
        );
    });

    it('POST /v1/auth/login', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          email: 'admin@clubconnect.com',
          password: faker.internet.password(),
        })
        .expect(400)
        .expect(
          {
            statusCode: 400,
            message: 'Invalid credentials',
            error: 'Bad Request',
          },
          done,
        );
    });
  });

  describe('it should login successfully', () => {
    let newUser: User;

    beforeAll(async () => {
      const usersService = app.get(UsersService);
      newUser = await usersService.create({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        password: 'TestPassword123',
        is_admin: true,
      });

      const rolesService = app.get(RolesService);

      const role = await rolesService.create({
        name: 'Test Role',
        description: 'A role for testing',
      });

      await rolesService.assignUserRole({
        user_id: newUser.id,
        role_id: role.id,
      });

      const permissionsService = app.get(PermissionsService);
      const permission = await permissionsService.create({
        subject: 'user',
        action: 'create',
        description: 'This permission allows creating users.',
      });

      await rolesService.assignPermissions(role.id, [permission.id]);
    });

    it('POST /v1/auth/login', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          email: newUser.email,
          password: 'TestPassword123',
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('refresh_token');
          expect(res.body.data.user).toHaveProperty('user_role');
          expect(res.body.data.user.user_role).toHaveProperty('id');
          expect(res.body.data.user.user_role).toHaveProperty('role');
          expect(res.body.data.user.user_role.role).toHaveProperty('name');
          expect(res.body.data.user.user_role.role).toHaveProperty(
            'description',
          );
          expect(res.body.data.user.user_role.role).toHaveProperty(
            'permissions',
          );
          expect(res.body.data.user.user_role.role.permissions).toBeInstanceOf(
            Array,
          );
          expect(
            res.body.data.user.user_role.role.permissions.length,
          ).toBeGreaterThan(0);

          access_token = res.body.data.access_token;
          refresh_token = res.body.data.refresh_token;
          expect(res.body.data).toHaveProperty('is_first_login', true);

          return done();
        });
    });
  });

  describe('it should get currently logged in user', () => {
    it('GET /v1/auth/user', (done) => {
      request(app.getHttpServer())
        .get('/v1/auth/user')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200, done);
    });
  });

  describe('it should refresh the token', () => {
    it('POST /v1/auth/refresh', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/refresh')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          refresh_token,
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('refresh_token');

          return done();
        });
    });

    describe('request new csrf token', () => {
      beforeAll(async () => {
        csrf = await getCsrfToken(app);
      });
      it('POST /v1/auth/refresh', (done) => {
        request(app.getHttpServer())
          .post('/v1/auth/refresh')
          .set('x-csrf-token', csrf.token)
          .set('x-session-id', csrf.session_id)
          .send({
            refresh_token,
          })
          .expect(201)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data).toHaveProperty('access_token');
            expect(res.body.data).toHaveProperty('refresh_token');

            return done();
          });
      });
    });
  });

  describe('it should throw an error if you try to use the refresh_token to access resources', () => {
    it('GET /v1/auth/user', (done) => {
      request(app.getHttpServer())
        .get('/v1/auth/user')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .set('Authorization', `Bearer ${refresh_token}`)
        .expect(401, done);
    });
  });

  describe('it should update the user password', () => {
    let user: User;
    let user_access_token: string;

    beforeAll(async () => {
      const usersService = app.get(UsersService);
      user = await usersService.create({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        password: 'OldPassword123',
        is_admin: true,
      });
    });

    it('should log the user in to get a valid bearer token', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          email: user.email,
          password: 'OldPassword123',
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('refresh_token');

          user_access_token = res.body.data.access_token;

          return done();
        });
    });

    it('should throw an error if the old password is incorrect', (done) => {
      request(app.getHttpServer())
        .patch(`/v1/auth/users/password`)
        .set('Authorization', `Bearer ${user_access_token}`)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          old_password: 'WrongOldPassword123',
          password: 'NewPassword123',
        })
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('message', 'Invalid credentials');

          return done();
        });
    });

    it('PATCH /v1/auth/users/password', (done) => {
      request(app.getHttpServer())
        .patch(`/v1/auth/users/password`)
        .set('Authorization', `Bearer ${user_access_token}`)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          old_password: 'OldPassword123',
          password: 'NewPassword123',
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty(
            'message',
            'Password updated successfully',
          );

          return done();
        });
    });

    it('should be able to login with the new password', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .send({
          email: user.email,
          password: 'NewPassword123',
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('refresh_token');

          return done();
        });
    });
  });
});
