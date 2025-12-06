import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { CreateSizeDto } from '../../src/domains/shared/sizes/dto/create-size.dto';
import { SizeDto } from '../../src/domains/shared/sizes/dto/size.dto';
import { UpdateSizeDto } from '../../src/domains/shared/sizes/dto/update-size.dto';
import { SizesService } from '../../src/domains/shared/sizes/sizes.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('SizesController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let admin: UserDto;
  let sizesService: SizesService;
  let size: SizeDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    sizesService = app.get(SizesService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it('/ (GET)', (done) => {
    request.get('/v1/sizes').expect(200, done);
  });

  describe('it should create a size', () => {
    afterAll(async () => {
      const l = await sizesService.findOneBy({
        id: size.id,
      });

      expect(l).not.toBeNull();
    });

    it('/ (POST)', (done) => {
      const req = {
        value: 42,
      } satisfies CreateSizeDto;

      request
        .post('/v1/sizes', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.value).toEqual(req.value);
          size = res.body.data;

          return done();
        });
    });

    it('should throw an error if size already exists', (done) => {
      const req = {
        value: size.value,
      } satisfies CreateSizeDto;

      request.post('/v1/sizes', req).expect(400, done);
    });
  });

  describe('it should retrieve sizes', () => {
    beforeAll(async () => {
      await sizesService.create({
        value: 420,
      });
    });

    it('/ (GET)', (done) => {
      request
        .get('/v1/sizes')
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
        .get('/v1/sizes/search?query=42')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data.some((s: SizeDto) => s.value === 42)).toBe(true);
          expect(res.body.data.some((s: SizeDto) => s.value === 420)).toBe(
            true,
          );

          return done();
        });
    });

    it('/sizes?limit=1&page=1 (GET)', (done) => {
      request
        .get('/v1/sizes?limit=1&page=1')
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

  describe('it should retrieve a size by id', () => {
    it('/:id (GET)', (done) => {
      request
        .get(`/v1/sizes/${size.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(size.id);
          expect(res.body.data.value).toBe(size.value);

          return done();
        });
    });

    it('/:id (GET) should throw an error if size does not exist', (done) => {
      request.get(`/v1/sizes/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should update a size', () => {
    beforeAll(async () => {
      const l = await sizesService.create({
        value: 43,
      });

      size = l.toDto();
    });

    afterAll(async () => {
      await sizesService.findOneByOrFail({ id: size.id });
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        value: 44,
      } satisfies UpdateSizeDto;

      request.patch(`/v1/sizes/${size.id}`, req).expect(200, done);
    });

    it('/:id (PATCH) should throw an error if size does not exist', (done) => {
      const req = {
        value: 45,
      } satisfies UpdateSizeDto;

      request.patch(`/v1/sizes/${faker.string.uuid()}`, req).expect(404, done);
    });

    describe('it should throw an error if you try to update a size with an existing name or symbol', () => {
      let new_size_id: string;

      beforeAll(async () => {
        const l = await sizesService.create({
          value: 46,
        });

        new_size_id = l.id;
      });

      it('should throw an error if you try to update a size with an existing name or symbol', (done) => {
        const req = {
          value: 44,
        } satisfies UpdateSizeDto;
        request.patch(`/v1/sizes/${new_size_id}`, req).expect(400, done);
      });
    });
  });
});
