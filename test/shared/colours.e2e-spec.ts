import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { ColoursService } from '../../src/domains/shared/colours/colours.service';
import { ColourDto } from '../../src/domains/shared/colours/dto/colour.dto';
import { CreateColourDto } from '../../src/domains/shared/colours/dto/create-colour.dto';
import { UpdateColourDto } from '../../src/domains/shared/colours/dto/update-colour.dto';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('ColoursController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let admin: UserDto;
  let coloursService: ColoursService;
  let colour: ColourDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    coloursService = app.get(ColoursService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it('/ (GET)', (done) => {
    request.get('/v1/colours').expect(200, done);
  });

  describe('it should create a colour', () => {
    afterAll(async () => {
      const l = await coloursService.findOneBy({
        id: colour.id,
      });

      expect(l).not.toBeNull();
    });

    it('/ (POST)', (done) => {
      const req = {
        name: 'Red',
      } satisfies CreateColourDto;

      request
        .post('/v1/colours', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.name).toEqual(req.name);
          colour = res.body.data;

          return done();
        });
    });

    it('should throw an error if colour already exists', (done) => {
      const req = {
        name: colour.name,
      } satisfies CreateColourDto;

      request.post('/v1/colours', req).expect(400, done);
    });
  });

  describe('it should retrieve colours', () => {
    beforeAll(async () => {
      await coloursService.create({
        name: 'Blue',
      });
    });

    it('/ (GET)', (done) => {
      request
        .get('/v1/colours')
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
        .get('/v1/colours/search?query=blue')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].name).toEqual('Blue');

          return done();
        });
    });

    it('/colours?limit=1&page=1 (GET)', (done) => {
      request
        .get('/v1/colours?limit=1&page=1')
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

  describe('it should retrieve a colour by id', () => {
    it('/:id (GET)', (done) => {
      request
        .get(`/v1/colours/${colour.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(colour.id);
          expect(res.body.data.name).toBe(colour.name);

          return done();
        });
    });

    it('/:id (GET) should throw an error if colour does not exist', (done) => {
      request.get(`/v1/colours/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should update a colour', () => {
    beforeAll(async () => {
      const l = await coloursService.create({
        name: 'Green',
      });

      colour = l.toDto();
    });

    afterAll(async () => {
      await coloursService.findOneByOrFail({ id: colour.id });
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        name: 'Updated Colour Name',
      } satisfies UpdateColourDto;

      request.patch(`/v1/colours/${colour.id}`, req).expect(200, done);
    });

    it('/:id (PATCH) should throw an error if colour does not exist', (done) => {
      const req = {
        name: 'Non-existent Colour',
      } satisfies UpdateColourDto;

      request
        .patch(`/v1/colours/${faker.string.uuid()}`, req)
        .expect(404, done);
    });

    describe('it should throw an error if you try to update a colour with an existing name or symbol', () => {
      let new_colour_id: string;

      beforeAll(async () => {
        const l = await coloursService.create({
          name: 'Yellow',
        });

        new_colour_id = l.id;
      });

      it('should throw an error if you try to update a colour with an existing name or symbol', (done) => {
        const req = {
          name: colour.name,
        } satisfies UpdateColourDto;
        request.patch(`/v1/colours/${new_colour_id}`, req).expect(400, done);
      });
    });
  });
});
