import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { addDays, getUnixTime } from 'date-fns';
import { AbstractStartedContainer } from 'testcontainers';

import { UserDto } from '../../src/domains/auth/users/dto/user.dto';
import { LeadsService } from '../../src/domains/leads/leads.service';
import { InAppNotificationsService } from '../../src/domains/notifications/in-app-notifications/in-app-notifications.service';
import { FollowUpReminderJob } from '../../src/task-scheduler/jobs/follow-up-reminder.job';
import { getCsrfToken, loginAdmin, setupApplication } from '../setup/app';

describe('Follow-Up Reminder (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let admin: UserDto;
  let followUpReminder: FollowUpReminderJob;
  let inAppNotificationsService: InAppNotificationsService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    const csrf = await getCsrfToken(app);
    const loginResponse = await loginAdmin(app, csrf);
    admin = loginResponse.user;

    followUpReminder = app.get(FollowUpReminderJob);
    inAppNotificationsService = app.get(InAppNotificationsService);
  });

  afterAll(async () => {
    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('it should not send a notification since there are no follow-up dates', () => {
    beforeAll(async () => {
      const leadsService = app.get(LeadsService);

      await Promise.all([
        leadsService.create({
          admin_user_id: admin.id,
          email: faker.internet.email(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          phone_number: faker.phone.number(),
          company_name: faker.company.name(),
          source: 'website',
        }),
        leadsService.create({
          admin_user_id: admin.id,
          email: faker.internet.email(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          phone_number: faker.phone.number(),
          company_name: faker.company.name(),
          source: 'website',
        }),
      ]);
    });

    afterAll(async () => {
      const notifications = await inAppNotificationsService.findAll();
      expect(notifications.length).toBe(0);
    });

    it('it should run cron', async () => {
      await followUpReminder.handleCron();
    });
  });

  describe('it should send a notification since there are follow-up dates', () => {
    beforeAll(async () => {
      const leadsService = app.get(LeadsService);

      await Promise.all([
        leadsService
          .create({
            admin_user_id: admin.id,
            email: faker.internet.email(),
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            phone_number: faker.phone.number(),
            company_name: faker.company.name(),
            source: 'website',
          })
          .then((l) =>
            leadsService.update(l.id, {
              next_follow_up_at: getUnixTime(new Date()),
            }),
          ),
        leadsService
          .create({
            admin_user_id: admin.id,
            email: faker.internet.email(),
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            phone_number: faker.phone.number(),
            company_name: faker.company.name(),
            source: 'website',
          })
          .then((l) =>
            leadsService.update(l.id, {
              next_follow_up_at: getUnixTime(new Date()),
            }),
          ),
      ]);
    });

    afterAll(async () => {
      const notifications = await inAppNotificationsService.findAll();
      expect(notifications.length).toBe(2);
    });

    it('it should run cron', async () => {
      await followUpReminder.handleCron();
    });
  });

  describe('it should send a notification if the follow-up date is in the future', () => {
    beforeAll(async () => {
      const leadsService = app.get(LeadsService);

      await Promise.all([
        leadsService
          .create({
            admin_user_id: admin.id,
            email: faker.internet.email(),
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            phone_number: faker.phone.number(),
            company_name: faker.company.name(),
            source: 'website',
          })
          .then((l) =>
            leadsService.update(l.id, {
              next_follow_up_at: getUnixTime(addDays(new Date(), 2)),
            }),
          ),
      ]);
    });

    afterAll(async () => {
      const notifications = await inAppNotificationsService.findAll();
      expect(notifications.length).toBe(3);
    });

    it('it should run cron', async () => {
      await followUpReminder.handleCron(getUnixTime(addDays(new Date(), 2)));
    });
  });
});
