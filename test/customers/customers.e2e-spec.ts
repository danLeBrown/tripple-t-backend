import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { CustomersService } from '../../src/domains/customers/customers.service';
import { CreateCustomerDto } from '../../src/domains/customers/dto/create-customer.dto';
import { CustomerDto } from '../../src/domains/customers/dto/customer.dto';
import { UpdateCustomerDto } from '../../src/domains/customers/dto/update-customer.dto';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('CustomersController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let admin: UserDto;
  let customersService: CustomersService;
  let customer: CustomerDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    customersService = app.get(CustomersService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it.skip('/ (GET)', (done) => {
    request.get('/v1/customers').expect(200, done);
  });

  describe('it should create a customer', () => {
    afterAll(async () => {
      const l = await customersService.findOneBy({
        id: customer.id,
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
      } satisfies CreateCustomerDto;

      request
        .post('/v1/customers', req)
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
          customer = res.body.data;

          return done();
        });
    });

    it('should throw an error if customer already exists', (done) => {
      const req = {
        business_name: customer.business_name,
        contact_person_first_name: customer.contact_person_first_name,
        contact_person_last_name: customer.contact_person_last_name,
        contact_person_email: customer.contact_person_email,
        contact_person_phone_number: customer.contact_person_phone_number,
        address: customer.address,
        state: customer.state,
      } satisfies CreateCustomerDto;

      request.post('/v1/customers', req).expect(400, done);
    });
  });

  describe('it should retrieve customers', () => {
    beforeAll(async () => {
      await customersService.create({
        business_name: faker.company.name(),
        contact_person_first_name: 'John',
        contact_person_last_name: 'Doe',
        contact_person_email: faker.internet.email(),
        contact_person_phone_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        state: faker.location.state(),
      } satisfies CreateCustomerDto);
    });

    it.skip('/ (GET)', (done) => {
      request
        .get('/v1/customers')
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
        .get('/v1/customers/search?query=john')
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

    it('/customers/search?limit=1&page=1 (GET)', (done) => {
      request
        .get('/v1/customers/search?limit=1&page=1')
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

  describe('it should retrieve a customer by id', () => {
    it('/:id (GET)', (done) => {
      request
        .get(`/v1/customers/${customer.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(customer.id);
          expect(res.body.data.contact_person_first_name).toBe(
            customer.contact_person_first_name,
          );
          expect(res.body.data.contact_person_last_name).toBe(
            customer.contact_person_last_name,
          );
          expect(res.body.data.contact_person_email).toBe(
            customer.contact_person_email,
          );
          expect(res.body.data.contact_person_phone_number).toBe(
            customer.contact_person_phone_number,
          );

          return done();
        });
    });

    it('/:id (GET) should throw an error if customer does not exist', (done) => {
      request.get(`/v1/customers/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should update a customer', () => {
    beforeAll(async () => {
      customer = await customersService.create({
        business_name: faker.company.name(),
        contact_person_first_name: faker.person.firstName(),
        contact_person_last_name: faker.person.lastName(),
        contact_person_email: faker.internet.email(),
        contact_person_phone_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        state: faker.location.state(),
      } satisfies CreateCustomerDto);
    });

    afterAll(async () => {
      await customersService.findOneByOrFail({ id: customer.id });
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        contact_person_first_name: faker.person.firstName(),
        contact_person_last_name: faker.person.lastName(),
        contact_person_email: faker.internet.email(),
        contact_person_phone_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        state: faker.location.state(),
      } satisfies UpdateCustomerDto;

      request.patch(`/v1/customers/${customer.id}`, req).expect(200, done);
    });

    it('/:id (PATCH) should throw an error if customer does not exist', (done) => {
      const req = {
        contact_person_first_name: faker.person.firstName(),
        contact_person_last_name: faker.person.lastName(),
        contact_person_email: faker.internet.email(),
        contact_person_phone_number: faker.phone.number(),
        address: faker.location.streetAddress(),
        state: faker.location.state(),
      } satisfies UpdateCustomerDto;

      request
        .patch(`/v1/customers/${faker.string.uuid()}`, req)
        .expect(404, done);
    });

    describe('it should throw an error if you try to update a customer with an existing email or phone number', () => {
      let new_customer_id: string;

      beforeAll(async () => {
        const c = await customersService.create({
          business_name: faker.company.name(),
          contact_person_first_name: faker.person.firstName(),
          contact_person_last_name: faker.person.lastName(),
          contact_person_email: faker.internet.email(),
          contact_person_phone_number: faker.phone.number(),
          address: faker.location.streetAddress(),
          state: faker.location.state(),
        } satisfies CreateCustomerDto);

        new_customer_id = c.id;

        customer = await customersService.create({
          business_name: faker.company.name(),
          contact_person_first_name: faker.person.firstName(),
          contact_person_last_name: faker.person.lastName(),
          contact_person_email: faker.internet.email(),
          contact_person_phone_number: faker.phone.number(),
          address: faker.location.streetAddress(),
          state: faker.location.state(),
        } satisfies CreateCustomerDto);
      });

      it('should throw an error if you try to update a customer with an existing email or phone number', (done) => {
        const req = {
          contact_person_first_name: faker.person.firstName(),
          contact_person_email: customer.contact_person_email,
          contact_person_phone_number: customer.contact_person_phone_number,
        } satisfies UpdateCustomerDto;
        request
          .patch(`/v1/customers/${new_customer_id}`, req)
          .expect(400, done);
      });
    });
  });
});
