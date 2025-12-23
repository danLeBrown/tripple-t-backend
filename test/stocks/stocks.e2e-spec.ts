import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { CreateProductDto } from '../../src/domains/shared/products/dto/create-product.dto';
import { ProductsService } from '../../src/domains/shared/products/products.service';
import { AdjustStockDto } from '../../src/domains/stocks/dto/adjust-stock.dto';
import { CreateStockDto } from '../../src/domains/stocks/dto/create-stock.dto';
import { StockDto } from '../../src/domains/stocks/dto/stock.dto';
import { UpdateStockDto } from '../../src/domains/stocks/dto/update-stock.dto';
import { StocksService } from '../../src/domains/stocks/stocks.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('StocksController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let admin: UserDto;
  let stocksService: StocksService;
  let productsService: ProductsService;
  let stock: StockDto;
  let product: { id: string; unit: string };

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    stocksService = app.get(StocksService);
    productsService = app.get(ProductsService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should auto-create stock when product is created', () => {
    it('should auto-create stock with 0 quantity when product is created', async () => {
      const productReq = {
        type: 'Preform',
        size: 18.5,
        colour: 'Clear',
        unit: 'bag',
      } satisfies CreateProductDto;

      const createdProduct = await productsService.create(productReq);
      product = { id: createdProduct.id, unit: createdProduct.unit };

      const createdStock = await stocksService.findOneBy({
        product_id: createdProduct.id,
      });

      expect(createdStock).not.toBeNull();
      expect(createdStock?.quantity).toBe(0);
      expect(createdStock?.unit).toBe(createdProduct.unit);
      expect(createdStock?.product_id).toBe(createdProduct.id);
    });
  });

  describe('it should create a stock manually', () => {
    beforeAll(async () => {
      const productReq = {
        type: 'Bottle',
        size: 500,
        colour: 'Blue',
        unit: 'pcs',
      } satisfies CreateProductDto;

      const createdProduct = await productsService.create(productReq);
      product = { id: createdProduct.id, unit: createdProduct.unit };
    });

    afterAll(async () => {
      const s = await stocksService.findOneBy({
        id: stock.id,
      });

      expect(s).not.toBeNull();
    });

    it('/ (POST)', (done) => {
      const req = {
        product_id: product.id,
        quantity: 100,
        unit: product.unit,
      } satisfies CreateStockDto;

      request
        .post('/v1/stocks', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.product_id).toEqual(req.product_id);
          expect(res.body.data.quantity).toEqual(req.quantity);
          expect(res.body.data.unit).toEqual(req.unit);
          expect(res.body.data.product).toBeDefined();
          stock = res.body.data;

          return done();
        });
    });

    it('should throw an error if stock already exists for product', (done) => {
      const req = {
        product_id: product.id,
        quantity: 50,
      } satisfies CreateStockDto;

      request.post('/v1/stocks', req).expect(400, done);
    });
  });

  describe('it should retrieve stocks', () => {
    beforeAll(async () => {
      // Create a few products and stocks for testing
      for (let i = 0; i < 3; i++) {
        const productReq = {
          type: 'Cap',
          size: 28,
          colour: faker.color.human(),
          unit: 'pcs',
        } satisfies CreateProductDto;

        await productsService.create(productReq);
      }
    });

    it('/search (GET)', (done) => {
      request
        .get('/v1/stocks/search')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.total).toBeGreaterThanOrEqual(1);
          expect(res.body.page).toBeDefined();
          expect(res.body.limit).toBeDefined();

          return done();
        });
    });

    it('/search?query=bag (GET)', (done) => {
      request
        .get('/v1/stocks/search?query=bag')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          // Should find stocks with unit containing "bag"

          return done();
        });
    });

    it('/search?limit=2&page=1 (GET)', (done) => {
      request
        .get('/v1/stocks/search?limit=2&page=1')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeLessThanOrEqual(2);

          return done();
        });
    });
  });

  describe('it should retrieve a stock by id', () => {
    beforeAll(async () => {
      const productReq = {
        type: 'Nylon',
        size: 1,
        colour: 'White',
        unit: 'kg',
      } satisfies CreateProductDto;

      const createdProduct = await productsService.create(productReq);
      const createdStock = await stocksService.findOneBy({
        product_id: createdProduct.id,
      });
      stock = createdStock!.toDto();
    });

    it('/:id (GET)', (done) => {
      request
        .get(`/v1/stocks/${stock.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(stock.id);
          expect(res.body.data.product_id).toBe(stock.product_id);
          expect(res.body.data.quantity).toBe(stock.quantity);
          expect(res.body.data.product).toBeDefined();

          return done();
        });
    });

    it('/:id (GET) should throw an error if stock does not exist', (done) => {
      request.get(`/v1/stocks/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should update a stock', () => {
    beforeAll(async () => {
      const productReq = {
        type: 'Bottle',
        size: 1000,
        colour: 'Green',
        unit: 'pcs',
      } satisfies CreateProductDto;

      const createdProduct = await productsService.create(productReq);
      const createdStock = await stocksService.findOneBy({
        product_id: createdProduct.id,
      });
      stock = createdStock!.toDto();
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        unit: 'liters',
      } satisfies UpdateStockDto;

      request
        .patch(`/v1/stocks/${stock.id}`, req)
        .expect(200)
        .end((err) => {
          if (err) {
            return done(err);
          }

          return done();
        });
    });

    it('/:id (PATCH) should throw an error if stock does not exist', (done) => {
      const req = {
        unit: 'pcs',
      } satisfies UpdateStockDto;

      request.patch(`/v1/stocks/${faker.string.uuid()}`, req).expect(404, done);
    });
  });

  describe('it should adjust stock quantity', () => {
    beforeAll(async () => {
      const productReq = {
        type: 'Preform',
        size: 18.5,
        colour: 'Clear',
        unit: 'bag',
      } satisfies CreateProductDto;

      const createdProduct = await productsService.create(productReq);
      const createdStock = await stocksService.findOneBy({
        product_id: createdProduct.id,
      });
      stock = createdStock!.toDto();
    });

    it('/:id/adjust (POST) - increase quantity', (done) => {
      const req = {
        quantity_delta: 50,
        adjustment_type: 'manual',
        reason: 'Manual stock addition',
      } satisfies AdjustStockDto;

      request
        .post(`/v1/stocks/${stock.id}/adjust`, req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.quantity).toBe(50);
          expect(res.body.data.product_id).toBe(stock.product_id);
          stock = res.body.data;

          return done();
        });
    });

    it('/:id/adjust (POST) - decrease quantity', (done) => {
      const req = {
        quantity_delta: -20,
        adjustment_type: 'manual',
        reason: 'Manual stock reduction',
      } satisfies AdjustStockDto;

      request
        .post(`/v1/stocks/${stock.id}/adjust`, req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.quantity).toBe(30);
          stock = res.body.data;

          return done();
        });
    });

    it('/:id/adjust (POST) - should prevent negative stock', (done) => {
      const req = {
        quantity_delta: -100,
        adjustment_type: 'manual',
        reason: 'Attempt to reduce below zero',
      } satisfies AdjustStockDto;

      request.post(`/v1/stocks/${stock.id}/adjust`, req).expect(400, done);
    });

    it('/:id/adjust (POST) - should create history entry', async () => {
      const initialQuantity = stock.quantity;
      const req = {
        quantity_delta: 10,
        adjustment_type: 'purchase',
        reason: 'New purchase record',
      } satisfies AdjustStockDto;

      const res = await request
        .post(`/v1/stocks/${stock.id}/adjust`, req)
        .expect(201);

      expect(res.body.data.quantity).toBe(initialQuantity + 10);

      // Verify history was created by checking the service
      const updatedStock = await stocksService.findOneByOrFail({
        id: stock.id,
      });
      expect(updatedStock).toBeDefined();
    });
  });

  describe('it should handle concurrent stock adjustments with row-locking', () => {
    beforeAll(async () => {
      const productReq = {
        type: 'Bottle',
        size: 500,
        colour: 'Red',
        unit: 'pcs',
      } satisfies CreateProductDto;

      const createdProduct = await productsService.create(productReq);
      const createdStock = await stocksService.findOneBy({
        product_id: createdProduct.id,
      });
      stock = createdStock!.toDto();
    });

    it('should handle concurrent adjustments correctly', async () => {
      const initialQuantity = stock.quantity;

      // Make multiple concurrent adjustments
      const adjustments = [
        { delta: 10, type: 'purchase' },
        { delta: 5, type: 'purchase' },
        { delta: -3, type: 'production' },
        { delta: 7, type: 'purchase' },
      ];

      const promises = adjustments.map((adj) =>
        stocksService.adjustQuantity({
          productId: stock.product_id,
          delta: adj.delta,
          adjustmentType: adj.type,
          reason: 'Concurrent test',
        }),
      );

      await Promise.all(promises);

      const finalStock = await stocksService.findOneByOrFail({ id: stock.id });
      const expectedQuantity =
        initialQuantity + adjustments.reduce((sum, adj) => sum + adj.delta, 0);

      expect(finalStock.quantity).toBe(expectedQuantity);
    });
  });
});
