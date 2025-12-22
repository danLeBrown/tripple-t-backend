import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { CreateSupplierPurchaseRecordDto } from '../../src/domains/purchase-records/dto/create-supplier-purchase-record.dto';
import { PurchaseRecordDto } from '../../src/domains/purchase-records/dto/purchase-record.dto';
import { UpdatePurchaseRecordDto } from '../../src/domains/purchase-records/dto/update-purchase-record.dto';
import { PurchaseRecordsService } from '../../src/domains/purchase-records/purchase-records.service';
import { CreateProductDto } from '../../src/domains/shared/products/dto/create-product.dto';
import { Product } from '../../src/domains/shared/products/entities/product.entity';
import { ProductsService } from '../../src/domains/shared/products/products.service';
import { productType } from '../../src/domains/shared/products/types';
import { CreateSupplierDto } from '../../src/domains/suppliers/dto/create-supplier.dto';
import { Supplier } from '../../src/domains/suppliers/entities/supplier.entity';
import { SuppliersService } from '../../src/domains/suppliers/suppliers.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('PurchaseRecordsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let admin: UserDto;
  let purchaseRecordsService: PurchaseRecordsService;
  let purchaseRecord: PurchaseRecordDto;
  //   let purchaseRecords: PurchaseRecord[];

  let supplier: Supplier;
  let product: Product;
  let suppliersService: SuppliersService;
  let productsService: ProductsService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    purchaseRecordsService = app.get(PurchaseRecordsService);
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

    product = await productsService.create({
      type: faker.helpers.arrayElement(Object.values(productType)),
      size: faker.number.int({ min: 100, max: 10000 }),
      colour: faker.color.human(),
      unit: 'kg',
    } satisfies CreateProductDto);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should create a purchase record', () => {
    it('/suppliers/:supplier_id (POST)', (done) => {
      const req = {
        purchase_records: [
          {
            price_per_bag: faker.number.int({ min: 100, max: 10000 }),
            quantity_in_bags: faker.number.int({ min: 1, max: 100 }),
            purchased_at: faker.date.past().getTime(),
            product_id: product.id,
          },
        ],
        upload: {
          name: faker.system.fileName(),
          relative_url: `2025/06/${faker.system.fileName()}`,
        },
      } satisfies CreateSupplierPurchaseRecordDto;

      request
        .post(`/v1/purchase-records/suppliers/${supplier.id}`, req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toEqual(1);
          expect(res.body.data[0].total_price).toEqual(
            req.purchase_records[0].price_per_bag *
              req.purchase_records[0].quantity_in_bags,
          );
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toEqual(1);
          expect(res.body.data[0].upload_id).toBeDefined();
          expect(res.body.data[0].price_per_bag).toEqual(
            req.purchase_records[0].price_per_bag,
          );
          expect(res.body.data[0].quantity_in_bags).toEqual(
            req.purchase_records[0].quantity_in_bags,
          );
          expect(res.body.data[0].purchased_at).toEqual(
            req.purchase_records[0].purchased_at,
          );
          expect(res.body.data[0].product_id).toEqual(
            req.purchase_records[0].product_id,
          );

          purchaseRecord = res.body.data[0];
          return done();
        });
    });
  });

  describe('it should retrieve purchase records', () => {
    beforeAll(async () => {
      await purchaseRecordsService.createForSuppliers(supplier.id, {
        upload: {
          name: faker.system.fileName(),
          relative_url: `2025/06/${faker.system.fileName()}`,
        },
        purchase_records: [
          {
            price_per_bag: faker.number.int({ min: 100, max: 10000 }),
            quantity_in_bags: faker.number.int({ min: 1, max: 100 }),
            purchased_at: faker.date.past().getTime(),
            product_id: product.id,
          },
        ],
      });
    });

    it('/search (GET)', (done) => {
      request
        .get(
          `/v1/purchase-records/search?query=${supplier.business_name.slice(0, 3)}`,
        )
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].supplier_name).toBe(supplier.business_name);

          return done();
        });
    });

    it('/purchase-records/search?limit=1&page=1 (GET)', (done) => {
      request
        .get('/v1/purchase-records/search?limit=1&page=1')
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

  describe('it should retrieve a purchase record by id', () => {
    it('/:id (GET)', (done) => {
      request
        .get(`/v1/purchase-records/${purchaseRecord.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(purchaseRecord.id);
          expect(res.body.data.price_per_bag).toEqual(
            purchaseRecord.price_per_bag,
          );
          expect(res.body.data.quantity_in_bags).toEqual(
            purchaseRecord.quantity_in_bags,
          );
          expect(res.body.data.purchased_at).toEqual(
            purchaseRecord.purchased_at.toString(),
          );
          expect(res.body.data.product_id).toEqual(purchaseRecord.product_id);

          return done();
        });
    });

    it('/:id (GET) should throw an error if purchase record does not exist', (done) => {
      request
        .get(`/v1/purchase-records/${faker.string.uuid()}`)
        .expect(404, done);
    });
  });

  describe('it should update a expense', () => {
    const req = {
      quantity_in_bags: faker.number.int({ min: 1, max: 100 }),
      price_per_bag: faker.number.int({ min: 100, max: 10000 }),
      purchased_at: faker.date.past().getTime(),
    } satisfies UpdatePurchaseRecordDto;

    beforeAll(async () => {
      await purchaseRecordsService.createForSuppliers(supplier.id, {
        upload: {
          name: faker.system.fileName(),
          relative_url: `2025/06/${faker.system.fileName()}`,
        },
        purchase_records: [
          {
            price_per_bag: faker.number.int({ min: 100, max: 10000 }),
            quantity_in_bags: faker.number.int({ min: 1, max: 100 }),
            purchased_at: faker.date.past().getTime(),
            product_id: product.id,
          },
        ],
      });
    });

    afterAll(async () => {
      const updatedPurchaseRecord =
        await purchaseRecordsService.findOneByOrFail({
          id: purchaseRecord.id,
        });

      expect(updatedPurchaseRecord.total_price).toEqual(
        req.price_per_bag * req.quantity_in_bags,
      );
    });

    it('/:id (PATCH)', (done) => {
      request
        .patch(`/v1/purchase-records/${purchaseRecord.id}`, req)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.message).toBe('Purchase record updated');
          return done();
        });
    });

    it('/:id (PATCH) should throw an error if purchase record does not exist', (done) => {
      request
        .patch(`/v1/purchase-records/${faker.string.uuid()}`, req)
        .expect(404, done);
    });
  });
});
