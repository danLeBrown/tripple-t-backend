import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { UsersService } from '../../src/domains/auth/users/users.service';
import { InAppNotificationsService } from '../../src/domains/notifications/in-app-notifications/in-app-notifications.service';
import {
  getCsrfToken,
  loginAdmin,
  makeAuthenticatedRequest,
  setupApplication,
} from '../setup/app';

describe('InAppNotificationsController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let request: ReturnType<typeof makeAuthenticatedRequest>;
  let admin: UserDto;
  let inAppNotificationsService: InAppNotificationsService;
  let new_admin_id: string;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    request = makeAuthenticatedRequest(app, csrf, loginResponse.access_token);
    admin = loginResponse.user;

    inAppNotificationsService = app.get(InAppNotificationsService);
    const usersService = app.get(UsersService);

    const user = await usersService.create({
      email: faker.internet.email(),
      password: faker.internet.password(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      phone_number: faker.phone.number(),
      is_admin: true,
    });

    new_admin_id = user.id;
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should be able to fetch notifications belonging to a user', () => {
    beforeAll(async () => {
      await Promise.all([
        inAppNotificationsService.create({
          user_id: admin.id,
          title: faker.lorem.sentence(),
          message: faker.lorem.paragraph(),
        }),
        inAppNotificationsService.create({
          user_id: admin.id,
          title: faker.lorem.sentence(),
          message: faker.lorem.paragraph(),
        }),
      ]);
    });

    it('/ (GET)', (done) => {
      request
        .get(`/v1/in-app-notifications?user_id=${new_admin_id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toEqual(0);

          return done();
        });
    });

    it('/ (GET)', (done) => {
      request
        .get(`/v1/in-app-notifications?user_id=${admin.id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toEqual(2);

          expect(res.body.data[0]).toHaveProperty('id');
          expect(res.body.data[0]).toHaveProperty('user_id');
          expect(res.body.data[0]).toHaveProperty('title');
          expect(res.body.data[0]).toHaveProperty('message');
          expect(res.body.data[0]).toHaveProperty('read_at');

          return done();
        });
    });

    describe('it should be able to get unread notifications belonging to a user', () => {
      beforeAll(async () => {
        const notification = await inAppNotificationsService.create({
          user_id: admin.id,
          title: faker.lorem.sentence(),
          message: faker.lorem.paragraph(),
        });

        await inAppNotificationsService.markAsRead({
          user_id: admin.id,
          ids: [notification.id],
        });
      });

      it('/ (GET)', (done) => {
        request
          .get(`/v1/in-app-notifications?user_id=${admin.id}&is_read=false`)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toEqual(2);

            expect(res.body.data[0]).toHaveProperty('id');
            expect(res.body.data[0]).toHaveProperty('user_id');
            expect(res.body.data[0]).toHaveProperty('title');
            expect(res.body.data[0]).toHaveProperty('message');
            expect(res.body.data[0]).toHaveProperty('read_at');

            return done();
          });
      });
    });
  });

  describe('it should be able to mark notifications as read', () => {
    let notificationId: string;

    beforeAll(async () => {
      const notification = await inAppNotificationsService.create({
        user_id: admin.id,
        title: faker.lorem.sentence(),
        message: faker.lorem.paragraph(),
      });

      notificationId = notification.id;
    });

    it('/read (PATCH) (error if invalid ids)', (done) => {
      request
        .patch('/v1/in-app-notifications/read', {
          user_id: admin.id,
          ids: [faker.string.uuid()],
        })
        .expect(404, done);
    });

    it('/read (PATCH) (error if invalid ids)', (done) => {
      request
        .patch('/v1/in-app-notifications/read', {
          user_id: admin.id,
          ids: [notificationId, faker.string.uuid()],
        })
        .expect(400, done);
    });

    it('/read (PATCH)', (done) => {
      request
        .patch('/v1/in-app-notifications/read', {
          user_id: admin.id,
          ids: [notificationId],
        })
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toEqual(
            'Notifications marked as read successfully',
          );

          return done();
        });
    });
  });
});
