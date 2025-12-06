import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { CreateProductDto } from '../../src/domains/shared/products/dto/create-product.dto';
import { ProductDto } from '../../src/domains/shared/products/dto/product.dto';
import { UpdateProductDto } from '../../src/domains/shared/products/dto/update-product.dto';
import { ProductsService } from '../../src/domains/shared/products/products.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let admin: UserDto;
  let productsService: ProductsService;
  let product: ProductDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    productsService = app.get(ProductsService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it('/ (GET)', (done) => {
    request.get('/v1/products').expect(200, done);
  });

  describe('it should create a product', () => {
    afterAll(async () => {
      const l = await productsService.findOneBy({
        id: product.id,
      });

      expect(l).not.toBeNull();
    });

    it('/ (POST)', (done) => {
      const req = {
        type: 'Bottle',
        size: 1,
        colour: 'Red',
        unit: 'kg',
      } satisfies CreateProductDto;

      request
        .post('/v1/products', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.type).toEqual(req.type);
          expect(res.body.data.size).toEqual(req.size);
          expect(res.body.data.colour).toEqual(req.colour);
          expect(res.body.data.unit).toEqual(req.unit);
          product = res.body.data;

          return done();
        });
    });

    it('should throw an error if product already exists', (done) => {
      const req = {
        type: product.type,
        size: product.size,
        colour: product.colour,
        unit: product.unit,
      } satisfies CreateProductDto;

      request.post('/v1/products', req).expect(400, done);
    });
  });

  describe('it should retrieve products', () => {
    beforeAll(async () => {
      await productsService.create({
        type: 'Bottle',
        size: 75,
        colour: 'Voltic Blue',
        unit: 'cl',
      });
    });

    it('/ (GET)', (done) => {
      request
        .get('/v1/products')
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
        .get('/v1/products/search?query=voltic')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].colour).toEqual('Voltic Blue');

          return done();
        });
    });

    it('/products?limit=1&page=1 (GET)', (done) => {
      request
        .get('/v1/products?limit=1&page=1')
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

  describe('it should retrieve a product by id', () => {
    it('/:id (GET)', (done) => {
      request
        .get(`/v1/products/${product.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(product.id);
          expect(res.body.data.type).toBe(product.type);
          expect(res.body.data.size).toBe(product.size);
          expect(res.body.data.colour).toBe(product.colour);
          expect(res.body.data.unit).toBe(product.unit);

          return done();
        });
    });

    it('/:id (GET) should throw an error if product does not exist', (done) => {
      request.get(`/v1/products/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should update a product', () => {
    beforeAll(async () => {
      const l = await productsService.create({
        type: 'Cap',
        size: 0,
        colour: 'Black',
        unit: 'pieces',
      });

      product = l.toDto();
    });

    afterAll(async () => {
      await productsService.findOneByOrFail({ id: product.id });
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        type: 'Bottle',
        size: 2,
        colour: 'Green',
        unit: 'liters',
      } satisfies UpdateProductDto;

      request.patch(`/v1/products/${product.id}`, req).expect(200, done);
    });

    it('/:id (PATCH) should throw an error if product does not exist', (done) => {
      const req = {
        type: 'Nylon',
        size: 3,
        colour: 'White',
        unit: 'meters',
      } satisfies UpdateProductDto;

      request
        .patch(`/v1/products/${faker.string.uuid()}`, req)
        .expect(404, done);
    });

    describe('it should throw an error if you try to update a product with an existing name or symbol', () => {
      let new_product_id: string;

      beforeAll(async () => {
        const l = await productsService.create({
          type: 'Preform',
          size: 5,
          colour: 'Transparent',
          unit: 'grams',
        });

        new_product_id = l.id;
      });

      it('should throw an error if you try to update a product with an existing name or symbol', (done) => {
        const req = {
          type: product.type,
          size: product.size,
          colour: product.colour,
          unit: product.unit,
        } satisfies UpdateProductDto;
        request.patch(`/v1/products/${new_product_id}`, req).expect(400, done);
      });
    });
  });
});
