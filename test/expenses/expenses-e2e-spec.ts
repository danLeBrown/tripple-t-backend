import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { CreateExpenseDto } from '../../src/domains/expenses/dto/create-expense.dto';
import { ExpenseDto } from '../../src/domains/expenses/dto/expense.dto';
import { UpdateExpenseDto } from '../../src/domains/expenses/dto/update-expense.dto';
import { ExpensesService } from '../../src/domains/expenses/expenses.service';
import { EXPENSE_CATEGORIES } from '../../src/domains/expenses/types';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('ExpensesController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let admin: UserDto;
  let expensesService: ExpensesService;
  let expense: ExpenseDto;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    expensesService = app.get(ExpensesService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  it.skip('/ (GET)', (done) => {
    request.get('/v1/expenses').expect(200, done);
  });

  describe('it should create a expense', () => {
    afterAll(async () => {
      const l = await expensesService.findOneBy({
        id: expense.id,
      });

      expect(l).not.toBeNull();
    });

    it('/ (POST)', (done) => {
      const req = {
        category: faker.helpers.arrayElement(Object.values(EXPENSE_CATEGORIES)),
        amount: faker.number.int({ min: 100, max: 10000 }),
        narration: faker.lorem.sentence(),
        reported_at: faker.date.past().getTime(),
      } satisfies CreateExpenseDto;

      request
        .post('/v1/expenses', req)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data.category).toEqual(req.category);
          expect(res.body.data.amount).toEqual(req.amount);
          expect(res.body.data.narration).toEqual(req.narration);
          expect(res.body.data.reported_at).toEqual(req.reported_at);
          expense = res.body.data;

          return done();
        });
    });
  });

  describe('it should retrieve expenses', () => {
    beforeAll(async () => {
      await expensesService.create({
        category: faker.helpers.arrayElement(Object.values(EXPENSE_CATEGORIES)),
        amount: faker.number.int({ min: 100, max: 10000 }),
        narration: faker.lorem.sentence(),
        reported_at: faker.date.past().getTime(),
      } satisfies CreateExpenseDto);
    });

    it.skip('/ (GET)', (done) => {
      request
        .get('/v1/expenses')
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
        .get(`/v1/expenses/search?query=${expense.narration}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          expect(res.body.data[0].narration).toContain(expense.narration);

          return done();
        });
    });

    it('/expenses/search?limit=1&page=1 (GET)', (done) => {
      request
        .get('/v1/expenses/search?limit=1&page=1')
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

  describe('it should retrieve a expense by id', () => {
    it('/:id (GET)', (done) => {
      request
        .get(`/v1/expenses/${expense.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(expense.id);
          expect(res.body.data.narration).toContain(expense.narration);
          expect(res.body.data.amount).toEqual(expense.amount);
          expect(res.body.data.category).toEqual(expense.category);
          expect(res.body.data.reported_at).toEqual(expense.reported_at);

          return done();
        });
    });

    it('/:id (GET) should throw an error if expense does not exist', (done) => {
      request.get(`/v1/expenses/${faker.string.uuid()}`).expect(404, done);
    });
  });

  describe('it should update a expense', () => {
    beforeAll(async () => {
      expense = await expensesService.create({
        category: faker.helpers.arrayElement(Object.values(EXPENSE_CATEGORIES)),
        amount: faker.number.int({ min: 100, max: 10000 }),
        narration: faker.lorem.sentence(),
        reported_at: faker.date.past().getTime(),
      } satisfies CreateExpenseDto);
    });

    afterAll(async () => {
      await expensesService.findOneByOrFail({ id: expense.id });
    });

    it('/:id (PATCH)', (done) => {
      const req = {
        narration: faker.lorem.sentence(),
        reported_at: faker.date.past().getTime(),
      } satisfies UpdateExpenseDto;

      request.patch(`/v1/expenses/${expense.id}`, req).expect(200, done);
    });

    it('/:id (PATCH) should throw an error if expense does not exist', (done) => {
      const req = {
        narration: faker.lorem.sentence(),
        reported_at: faker.date.past().getTime(),
      } satisfies UpdateExpenseDto;

      request
        .patch(`/v1/expenses/${faker.string.uuid()}`, req)
        .expect(404, done);
    });
  });
});
