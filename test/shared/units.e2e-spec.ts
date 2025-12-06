import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { CreateUnitDto } from '../../src/domains/shared/units/dto/create-unit.dto';
import { UnitDto } from '../../src/domains/shared/units/dto/unit.dto';
import { UpdateUnitDto } from '../../src/domains/shared/units/dto/update-unit.dto';
import { UnitsService } from '../../src/domains/shared/units/units.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('UnitsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let admin: UserDto;
  let unitsService: UnitsService;
  let unit: UnitDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    unitsService = app.get(UnitsService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it.skip('/ (GET)', (done) => {
    request.get('/v1/units').expect(200, done);
  });

  describe('it should create a unit', () => {
    afterAll(async () => {
      const l = await unitsService.findOneBy({
        id: unit.id,
      });

      expect(l).not.toBeNull();
    });

    it('/ (POST)', (done) => {
      const req = {
        name: 'Kilogram',
        symbol: 'kg',
      } satisfies CreateUnitDto;

      request
        .post('/v1/units', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.name).toEqual(req.name);
          unit = res.body.data;

          return done();
        });
    });

    it('should throw an error if unit already exists', (done) => {
      const req = {
        name: unit.name,
        symbol: unit.symbol,
      } satisfies CreateUnitDto;

      request.post('/v1/units', req).expect(400, done);
    });
  });

  describe('it should retrieve units', () => {
    beforeAll(async () => {
      await unitsService.create({
        name: 'Centimeter',
        symbol: 'cm',
      });
    });

    it.skip('/ (GET)', (done) => {
      request
        .get('/v1/units')
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
        .get('/v1/units/search?query=centimeter')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].name).toEqual('Centimeter');

          return done();
        });
    });

    it('/units?limit=1&page=1 (GET)', (done) => {
      request
        .get('/v1/units?limit=1&page=1')
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

  describe('it should retrieve a unit by id', () => {
    it('/:id (GET)', (done) => {
      request
        .get(`/v1/units/${unit.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(unit.id);
          expect(res.body.data.name).toBe(unit.name);
          expect(res.body.data.symbol).toBe(unit.symbol);

          return done();
        });
    });

    it('/:id (GET) should throw an error if unit does not exist', (done) => {
      request.get(`/v1/units/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should update a unit', () => {
    beforeAll(async () => {
      const l = await unitsService.create({
        name: 'Liter',
        symbol: 'l',
      });

      unit = l.toDto();
    });

    afterAll(async () => {
      await unitsService.findOneByOrFail({ id: unit.id });
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        name: 'Updated Unit Name',
      } satisfies UpdateUnitDto;

      request.patch(`/v1/units/${unit.id}`, req).expect(200, done);
    });

    it('/:id (PATCH) should throw an error if unit does not exist', (done) => {
      const req = {
        name: 'Non-existent Unit',
      } satisfies UpdateUnitDto;

      request.patch(`/v1/units/${faker.string.uuid()}`, req).expect(404, done);
    });

    describe('it should throw an error if you try to update a unit with an existing name', () => {
      let new_unit_id: string;

      beforeAll(async () => {
        const l = await unitsService.create({
          name: 'Liter',
          symbol: 'l',
        });

        new_unit_id = l.id;
      });

      it('should throw an error if you try to update a unit with an existing name', (done) => {
        const req = {
          name: unit.name,
        } satisfies UpdateUnitDto;
        request.patch(`/v1/units/${new_unit_id}`, req).expect(400, done);
      });
    });
  });
});
