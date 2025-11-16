import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigsModule } from './app-configs/app-config.module';
import { AppConfigService } from './app-configs/app-config.service';
import { AppDataSource } from './data-source';
import { AnalyticsModule } from './domains/analytics/analytics.module';
import { AuditLogsModule } from './domains/audit-logs/dto/audit-logs.module';
import { AuditLogInterceptor } from './domains/audit-logs/interceptors/audit-log.interceptor';
import { AuthModule } from './domains/auth/auth.module';
import { ClientsModule } from './domains/clients/clients.module';
import { CustomersModule } from './domains/customers/customers.module';
import { LeadsModule } from './domains/leads/leads.module';
import { NotificationsModule } from './domains/notifications/notifications.module';
import { SharedModule } from './domains/shared/shared.module';
import { UploadsModule } from './domains/uploads/uploads.module';
import { WebhooksModule } from './domains/webhooks/webhooks.module';
import { JwtOrApiKeyGuard } from './guards/jwt-or-api-key.guard';
import { HeaderCsrfModule } from './middlewares/header-csrf.middleware';
import { RedisModule } from './redis/redis.module';
import { TaskSchedulerModule } from './task-scheduler/task-scheduler.module';
import { ValidatorsModule } from './validators/validators.module';

@Module({
  imports: [
    AppConfigsModule,
    TypeOrmModule.forRoot({ ...AppDataSource.options, autoLoadEntities: true }),
    SentryModule.forRoot(),
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    BullModule.forRootAsync({
      imports: [AppConfigsModule],
      useFactory: (configService: AppConfigService) => {
        const url = new URL(configService.get<string>('REDIS_URL'));
        return {
          prefix: configService.get<string>('QUEUE_PREFIX'),
          connection: {
            host: url.hostname,
            port: Number(url.port),
            password: url.password,
            username: url.username,
          },
        };
      },
      inject: [AppConfigService],
    }),
    ScheduleModule.forRoot(),
    HeaderCsrfModule,
    RedisModule,
    ValidatorsModule,
    AuthModule,
    LeadsModule,
    ClientsModule,
    SharedModule,
    UploadsModule,
    AuditLogsModule,
    WebhooksModule,
    AnalyticsModule,
    TaskSchedulerModule,
    NotificationsModule,
    HttpModule.register({ global: true }),
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtOrApiKeyGuard,
    },
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
