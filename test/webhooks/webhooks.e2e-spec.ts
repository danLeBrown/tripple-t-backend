import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AbstractStartedContainer } from 'testcontainers';

import { Webhook } from '../../src/domains/webhooks/entities/webhook.entity';
import { IC9JAWebhook } from '../../src/domains/webhooks/interfaces';
import { WebhooksService } from '../../src/domains/webhooks/webhooks.service';
import { c9jaData } from '../mock/c9ja-client-data';
import { setupApplication } from '../setup/app';

describe('WebhooksController (e2e)', () => {
  let app: INestApplication;
  let containers: AbstractStartedContainer[];
  let webhooksService: WebhooksService;

  beforeAll(async () => {
    [app, containers] = await setupApplication();
    webhooksService = app.get(WebhooksService);
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await Promise.all([app.close(), ...containers.map((c) => c.stop())]);
  });

  describe('POST /v1/webhooks/connect-nigeria', () => {
    afterAll(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    it('should throw an error if an invalid payload is sent', (done) => {
      request(app.getHttpServer())
        .post('/v1/webhooks/connect-nigeria')
        .send({
          foo: 'bar',
        })
        .expect(422, done);
    });

    it('should successfully process a valid payload', (done) => {
      request(app.getHttpServer())
        .post('/v1/webhooks/connect-nigeria')
        .send({
          event: 'subscription.created',
          data: {
            user: c9jaData[0],
          },
        } satisfies IC9JAWebhook)
        .expect(201, done);
    });

    it('should not create a webhook if it already exists', (done) => {
      request(app.getHttpServer())
        .post('/v1/webhooks/connect-nigeria')
        .send({
          event: 'subscription.created',
          data: {
            user: c9jaData[0],
          },
        } satisfies IC9JAWebhook)
        .expect(201)
        .end(async (err, _res) => {
          if (err) {
            return done(err);
          }

          const maxWaitTime = 5000; // Maximum wait time in milliseconds
          const pollInterval = 100; // Polling interval in milliseconds
          let webhooks: Webhook[] = [];
          const startTime = Date.now();

          while (Date.now() - startTime < maxWaitTime) {
            webhooks = await webhooksService.findBy();
            if (webhooks.length > 0) {
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
          }
          expect(webhooks).toHaveLength(1);
          //   expect(webhooks[0]).toMatchObject({
          //     event: 'user.created',
          //     reference,
          //     data: {
          //       first_name: expect.any(String),
          //       last_name: expect.any(String),
          //       email: expect.any(String),
          //       phone_number: expect.any(String),
          //     },
          //   });

          return done();
        });
    });
  });
});
