import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { BottleProductionsService } from '../../src/domains/bottle-productions/bottle-productions.service';
import { BottleProductionDto } from '../../src/domains/bottle-productions/dto/bottle-production.dto';
import { CreateBottleProductionDto } from '../../src/domains/bottle-productions/dto/create-bottle-production.dto';
import { UpdateBottleProductionDto } from '../../src/domains/bottle-productions/dto/update-bottle-production.dto';
import { CreateProductDto } from '../../src/domains/shared/products/dto/create-product.dto';
import { Product } from '../../src/domains/shared/products/entities/product.entity';
import { ProductsService } from '../../src/domains/shared/products/products.service';
import { CreateSupplierDto } from '../../src/domains/suppliers/dto/create-supplier.dto';
import { Supplier } from '../../src/domains/suppliers/entities/supplier.entity';
import { SuppliersService } from '../../src/domains/suppliers/suppliers.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('BottleProductionsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let admin: UserDto;
  let bottleProductionsService: BottleProductionsService;
  let bottleProduction: BottleProductionDto;

  let supplier: Supplier;
  let preformProduct: Product;
  let bottleProduct: Product;
  let suppliersService: SuppliersService;
  let productsService: ProductsService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    bottleProductionsService = app.get(BottleProductionsService);
    suppliersService = app.get(SuppliersService);
    productsService = app.get(ProductsService);

    supplier = await suppliersService.create({
      business_name: faker.company.name(),
      contact_person_first_name: faker.person.firstName(),
      contact_person_last_name: faker.person.lastName(),
      contact_person_phone_number: faker.phone.number(),
      address: faker.location.streetAddress(),
      state: faker.location.state(),
    } satisfies CreateSupplierDto);

    preformProduct = await productsService.create({
      type: 'Preform',
      size: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
      colour: 'Red',
      unit: 'ml',
    } satisfies CreateProductDto);

    bottleProduct = await productsService.create({
      type: 'Bottle',
      size: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
      colour: faker.color.human(),
      unit: 'ml',
    } satisfies CreateProductDto);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create a bottle production (own production)', () => {
    it('/ (POST)', (done) => {
      const req = {
        preform_supplier_id: supplier.id,
        preform_product_id: preformProduct.id,
        bottle_product_id: bottleProduct.id,
        preform_size: 18.5,
        preforms_used: 1000,
        preforms_defective: 50,
        bottle_size: 18.5,
        bottles_produced: 950,
        bottles_defective: 25,
        produced_at: Math.floor(Date.now() / 1000),
      } satisfies CreateBottleProductionDto;

      request
        .post('/v1/bottle-productions', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();
          expect(res.body.data.preform_supplier_id).toEqual(
            req.preform_supplier_id,
          );
          expect(res.body.data.supplier_name).toEqual(supplier.business_name); // Auto-populated from supplier
          expect(res.body.data.preform_name).toEqual(preformProduct.name); // Auto-populated from product
          expect(res.body.data.bottle_name).toEqual(bottleProduct.name); // Auto-populated from product
          expect(res.body.data.preform_size).toEqual(req.preform_size);
          expect(res.body.data.preform_color).toEqual(
            res.body.data.bottle_color,
          );
          expect(res.body.data.preforms_used).toEqual(req.preforms_used);
          expect(res.body.data.preforms_defective).toEqual(
            req.preforms_defective,
          );
          expect(res.body.data.bottle_size).toEqual(req.bottle_size);
          expect(res.body.data.bottles_produced).toEqual(req.bottles_produced);
          expect(res.body.data.bottles_defective).toEqual(
            req.bottles_defective,
          );
          expect(res.body.data.preforms_successful).toEqual(
            req.preforms_used - req.preforms_defective,
          );
          expect(res.body.data.bottles_successful).toEqual(
            req.bottles_produced - req.bottles_defective,
          );

          bottleProduction = res.body.data;
          return done();
        });
    });

    it('should create a bottle production with notes', (done) => {
      const req = {
        preform_supplier_id: supplier.id,
        preform_product_id: preformProduct.id,
        bottle_product_id: bottleProduct.id,
        preform_size: 25.5,
        preforms_used: 800,
        preforms_defective: 40,
        bottle_size: 25.5,
        bottles_produced: 760,
        bottles_defective: 20,
        produced_at: Math.floor(Date.now() / 1000),
        notes: 'Production run completed successfully',
      } satisfies CreateBottleProductionDto;

      request
        .post('/v1/bottle-productions', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.preform_product_id).toEqual(
            req.preform_product_id,
          );
          expect(res.body.data.bottle_product_id).toEqual(
            req.bottle_product_id,
          );
          expect(res.body.data.notes).toEqual(req.notes);
          return done();
        });
    });

    it('should throw an error if defective exceeds used', (done) => {
      const req = {
        preform_supplier_id: supplier.id,
        preform_product_id: preformProduct.id,
        bottle_product_id: bottleProduct.id,
        preform_size: 18.5,
        preforms_used: 100,
        preforms_defective: 150, // More than used
        bottle_size: 18.5,
        bottles_produced: 50,
        bottles_defective: 60, // More than produced
        produced_at: Math.floor(Date.now() / 1000),
      } satisfies CreateBottleProductionDto;

      request.post('/v1/bottle-productions', req).expect(400, done);
    });
  });

  describe('it should retrieve bottle productions', () => {
    beforeAll(async () => {
      await bottleProductionsService.create({
        preform_supplier_id: supplier.id,
        preform_product_id: preformProduct.id,
        bottle_product_id: bottleProduct.id,
        preform_size: 12.5,
        preforms_used: 600,
        preforms_defective: 30,
        bottle_size: 12.5,
        bottles_produced: 570,
        bottles_defective: 20,
        produced_at: Math.floor(Date.now() / 1000),
      });
    });

    it('/search (GET)', (done) => {
      request
        .get('/v1/bottle-productions/search?query=Red')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.total).toBeGreaterThanOrEqual(1);
          return done();
        });
    });

    it.skip('/search (GET) filter by preform_supplier_id', (done) => {
      request
        .get(`/v1/bottle-productions/search?preform_supplier_id=${supplier.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(
            res.body.data.every(
              (bp: BottleProductionDto) =>
                bp.preform_supplier_id === supplier.id,
            ),
          ).toBe(true);
          return done();
        });
    });

    it('/search (GET) with pagination', (done) => {
      request
        .get('/v1/bottle-productions/search?limit=1&page=1')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeLessThanOrEqual(1);
          return done();
        });
    });
  });

  describe('it should retrieve a bottle production by id', () => {
    it('/:id (GET)', (done) => {
      request
        .get(`/v1/bottle-productions/${bottleProduction.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(bottleProduction.id);
          expect(res.body.data.supplier).toBeDefined();
          expect(res.body.data.preforms_successful).toBeDefined();
          expect(res.body.data.bottles_successful).toBeDefined();
          return done();
        });
    });

    it('/:id (GET) should throw an error if production does not exist', (done) => {
      request
        .get(`/v1/bottle-productions/${faker.string.uuid()}`)
        .expect(404, done);
    });
  });

  describe('it should update a bottle production', () => {
    beforeAll(async () => {
      const production = await bottleProductionsService.create({
        preform_supplier_id: supplier.id,
        preform_product_id: preformProduct.id,
        bottle_product_id: bottleProduct.id,
        preform_size: 15.0,
        preforms_used: 400,
        preforms_defective: 20,
        bottle_size: 15.0,
        bottles_produced: 380,
        bottles_defective: 10,
        produced_at: Math.floor(Date.now() / 1000),
      });

      bottleProduction = production.toDto();
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        preforms_defective: 15,
        bottles_defective: 8,
        notes: 'Updated production notes',
      } satisfies UpdateBottleProductionDto;

      request
        .patch(`/v1/bottle-productions/${bottleProduction.id}`, req)
        .expect(200)
        .end((err, _res) => {
          if (err) {
            return done(err);
          }

          // Verify the update
          request
            .get(`/v1/bottle-productions/${bottleProduction.id}`)
            .expect(200)
            .end((fetchErr, fetchRes) => {
              if (fetchErr) {
                return done(fetchErr);
              }

              expect(fetchRes.body.data.preforms_defective).toEqual(
                req.preforms_defective,
              );
              expect(fetchRes.body.data.bottles_defective).toEqual(
                req.bottles_defective,
              );
              expect(fetchRes.body.data.notes).toEqual(req.notes);
              return done();
            });
        });
    });

    it('/:id (PATCH) should throw an error if production does not exist', (done) => {
      const req = {
        notes: 'Test notes',
      } satisfies UpdateBottleProductionDto;

      request
        .patch(`/v1/bottle-productions/${faker.string.uuid()}`, req)
        .expect(404, done);
    });
  });

  describe('it should delete a bottle production (soft delete)', () => {
    let productionToDelete: BottleProductionDto;

    beforeAll(async () => {
      const production = await bottleProductionsService.create({
        preform_supplier_id: supplier.id,
        preform_product_id: preformProduct.id,
        bottle_product_id: bottleProduct.id,
        preform_size: 10.0,
        preforms_used: 300,
        preforms_defective: 15,
        bottle_size: 10.0,
        bottles_produced: 285,
        bottles_defective: 10,
        produced_at: Math.floor(Date.now() / 1000),
      });

      productionToDelete = production.toDto();
    });

    it('/:id (DELETE)', (done) => {
      request
        .delete(`/v1/bottle-productions/${productionToDelete.id}`)
        .expect(200)
        .end((err, _res) => {
          if (err) {
            return done(err);
          }

          // Verify it's soft deleted (should return 404)
          request
            .get(`/v1/bottle-productions/${productionToDelete.id}`)
            .expect(404, done);
        });
    });
  });
});
