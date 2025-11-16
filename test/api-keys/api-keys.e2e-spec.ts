import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import _request from 'supertest';
import { AbstractStartedContainer } from 'testcontainers';

import { ApiKeysService } from '../../src/domains/auth/api-keys/api-keys.service';
import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('ApiKeysController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let admin: UserDto;
  let apiKeysService: ApiKeysService;
  let csrf: {
    token: string;
    session_id: string;
  };

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    apiKeysService = app.get(ApiKeysService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create an API key', () => {
    let key: string;

    afterAll(async () => {
      const existingApiKeys = await apiKeysService.findBy();

      expect(existingApiKeys).toHaveLength(1);

      const exe = await apiKeysService.validateApiKey(key);
      expect(exe).toBeTruthy();
    });

    it('POST /v1/api-keys', (done) => {
      request
        .post(`/v1/api-keys/users/${admin.id}`, {})
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('key');

          key = res.body.data.key;

          return done();
        });
    });
  });

  describe('it should validate an API key', () => {
    let key: string;
    beforeAll(async () => {
      ({ key } = await apiKeysService.createApiKey(admin.id));
    });

    it('GET /v1/api-keys/validate/:key (error)', (done) => {
      _request(app.getHttpServer())
        .get(`/v1/api-keys/validate/${key}`)
        .expect(401, done);
    });

    it('GET /v1/api-keys/validate/:key (error)', (done) => {
      _request(app.getHttpServer())
        .get(`/v1/api-keys/validate/${key}`)
        .set('Authorization', `Bearer ${faker.word.words()}`)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .expect(401, done);
    });

    it('GET /v1/api-keys/validate/:key with valid key (as bearer token) and CSRF token', (done) => {
      _request(app.getHttpServer())
        .get(`/v1/api-keys/validate/${key}`)
        .set('Authorization', `Bearer ${key}`)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('API Key is valid');

          return done();
        });
    });

    it.skip('GET /v1/api-keys/validate/:key with valid key (as x-api-key) and CSRF token', (done) => {
      _request(app.getHttpServer())
        .get(`/v1/api-keys/validate/${key}`)
        .set('x-api-key', key)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('API Key is valid');

          return done();
        });
    });
  });

  describe('it should list API keys', () => {
    it('GET /v1/api-keys', (done) => {
      request
        .get('/v1/api-keys')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toBeInstanceOf(Array);

          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0]).toHaveProperty('id');
          expect(res.body.data[0]).toHaveProperty('user_id');
          expect(res.body.data[0]).not.toHaveProperty('key');
          expect(res.body.data[0]).toHaveProperty('last_four_chars');

          return done();
        });
    });
  });

  describe('it should delete an API key', () => {
    let key: string;

    beforeAll(async () => {
      ({ key } = await apiKeysService.createApiKey(admin.id));
    });

    it('DELETE /v1/api-keys/user/:userId (error)', (done) => {
      _request(app.getHttpServer())
        .delete(`/v1/api-keys/user/${admin.id}`)
        .set('Authorization', `Bearer ${faker.word.words()}`)
        .set('x-csrf-token', csrf.token)
        .set('x-session-id', csrf.session_id)
        .expect(401, done);
    });

    it('DELETE /v1/api-keys/user/:userId with invalid user ID', (done) => {
      request.delete('/v1/api-keys/user/invalid-id').expect(400, done);
    });

    it('DELETE /v1/api-keys/user/:userId with valid user ID', (done) => {
      request
        .delete(`/v1/api-keys/user/${admin.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('API Key deleted');

          return done();
        });
    });

    it('should not find the deleted API key', async () => {
      const exe = await apiKeysService.validateApiKey(key);
      expect(exe).toBeNull();
    });
  });
});
