import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { CreateSupplierDto } from '../../src/domains/suppliers/dto/create-supplier.dto';
import { SupplierDto } from '../../src/domains/suppliers/dto/supplier.dto';
import { UpdateSupplierDto } from '../../src/domains/suppliers/dto/update-supplier.dto';
import { SuppliersService } from '../../src/domains/suppliers/suppliers.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('SuppliersController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let admin: UserDto;
  let suppliersService: SuppliersService;
  let supplier: SupplierDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    suppliersService = app.get(SuppliersService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it.skip('/ (GET)', (done) => {
    request.get('/v1/suppliers').expect(200, done);
  });

  describe('it should create a supplier', () => {
    afterAll(async () => {
      const l = await suppliersService.findOneBy({
        id: supplier.id,
      });

      expect(l).not.toBeNull();
    });

    it('/ (POST)', (done) => {
      const req = {
        business_name: faker.company.name(),
        contact_person_first_name: faker.person.firstName(),
        contact_person_last_name: faker.person.lastName(),
        contact_person_email: faker.internet.email(),
        contact_person_phone_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        state: faker.location.state(),
      } satisfies CreateSupplierDto;

      request
        .post('/v1/suppliers', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.business_name).toEqual(req.business_name);
          expect(res.body.data.contact_person_first_name).toEqual(
            req.contact_person_first_name,
          );
          expect(res.body.data.contact_person_last_name).toEqual(
            req.contact_person_last_name,
          );
          expect(res.body.data.contact_person_email).toEqual(
            req.contact_person_email.toLowerCase(),
          );
          expect(res.body.data.contact_person_phone_number).toEqual(
            req.contact_person_phone_number,
          );
          expect(res.body.data.address).toEqual(req.address);
          expect(res.body.data.state).toEqual(req.state);
          supplier = res.body.data;

          return done();
        });
    });

    it('should throw an error if supplier already exists', (done) => {
      const req = {
        business_name: supplier.business_name,
        contact_person_first_name: supplier.contact_person_first_name,
        contact_person_last_name: supplier.contact_person_last_name,
        contact_person_email: supplier.contact_person_email ?? undefined,
        contact_person_phone_number: supplier.contact_person_phone_number,
        address: supplier.address,
        state: supplier.state,
      } satisfies CreateSupplierDto;

      request.post('/v1/suppliers', req).expect(400, done);
    });
  });

  describe('it should retrieve suppliers', () => {
    beforeAll(async () => {
      await suppliersService.create({
        business_name: faker.company.name(),
        contact_person_first_name: 'John',
        contact_person_last_name: 'Doe',
        contact_person_email: faker.internet.email(),
        contact_person_phone_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        state: faker.location.state(),
      } satisfies CreateSupplierDto);
    });

    it.skip('/ (GET)', (done) => {
      request
        .get('/v1/suppliers')
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
        .get('/v1/suppliers/search?query=john')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].contact_person_first_name).toEqual('John');
          expect(res.body.data[0].contact_person_last_name).toEqual('Doe');

          return done();
        });
    });

    it('/suppliers/search?limit=1&page=1 (GET)', (done) => {
      request
        .get('/v1/suppliers/search?limit=1&page=1')
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

  describe('it should retrieve a supplier by id', () => {
    it('/:id (GET)', (done) => {
      request
        .get(`/v1/suppliers/${supplier.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(supplier.id);
          expect(res.body.data.contact_person_first_name).toBe(
            supplier.contact_person_first_name,
          );
          expect(res.body.data.contact_person_last_name).toBe(
            supplier.contact_person_last_name,
          );
          expect(res.body.data.contact_person_email).toBe(
            supplier.contact_person_email,
          );
          expect(res.body.data.contact_person_phone_number).toBe(
            supplier.contact_person_phone_number,
          );

          return done();
        });
    });

    it('/:id (GET) should throw an error if supplier does not exist', (done) => {
      request.get(`/v1/suppliers/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should update a supplier', () => {
    beforeAll(async () => {
      supplier = await suppliersService.create({
        business_name: faker.company.name(),
        contact_person_first_name: faker.person.firstName(),
        contact_person_last_name: faker.person.lastName(),
        contact_person_email: faker.internet.email(),
        contact_person_phone_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        state: faker.location.state(),
      } satisfies CreateSupplierDto);
    });

    afterAll(async () => {
      await suppliersService.findOneByOrFail({ id: supplier.id });
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        contact_person_first_name: faker.person.firstName(),
        contact_person_last_name: faker.person.lastName(),
        contact_person_email: faker.internet.email(),
        contact_person_phone_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        state: faker.location.state(),
      } satisfies UpdateSupplierDto;

      request.patch(`/v1/suppliers/${supplier.id}`, req).expect(200, done);
    });

    it('/:id (PATCH) should throw an error if supplier does not exist', (done) => {
      const req = {
        contact_person_first_name: faker.person.firstName(),
        contact_person_last_name: faker.person.lastName(),
        contact_person_email: faker.internet.email(),
        contact_person_phone_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        state: faker.location.state(),
      } satisfies UpdateSupplierDto;

      request
        .patch(`/v1/suppliers/${faker.string.uuid()}`, req)
        .expect(404, done);
    });

    describe('it should throw an error if you try to update a supplier with an existing email or phone number', () => {
      let new_supplier_id: string;

      beforeAll(async () => {
        const c = await suppliersService.create({
          business_name: faker.company.name(),
          contact_person_first_name: faker.person.firstName(),
          contact_person_last_name: faker.person.lastName(),
          contact_person_email: faker.internet.email(),
          contact_person_phone_number: faker.phone.number(),
          address: faker.location.streetAddress(),
          state: faker.location.state(),
        } satisfies CreateSupplierDto);

        new_supplier_id = c.id;

        supplier = await suppliersService.create({
          business_name: faker.company.name(),
          contact_person_first_name: faker.person.firstName(),
          contact_person_last_name: faker.person.lastName(),
          contact_person_email: faker.internet.email(),
          contact_person_phone_number: faker.phone.number(),
          address: faker.location.streetAddress(),
          state: faker.location.state(),
        } satisfies CreateSupplierDto);
      });

      it('should throw an error if you try to update a supplier with an existing email or phone number', (done) => {
        const req = {
          contact_person_first_name: faker.person.firstName(),
          contact_person_email: supplier.contact_person_email ?? undefined,
          contact_person_phone_number: supplier.contact_person_phone_number,
        } satisfies UpdateSupplierDto;
        request
          .patch(`/v1/suppliers/${new_supplier_id}`, req)
          .expect(400, done);
      });
    });
  });
});
