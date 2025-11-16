import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
} from 'class-validator';

import { IImportClientFromC9JA } from '@/task-scheduler/interfaces/import-client';

import { IC9JAWebhook } from '../interfaces';

export class ConnectNigeriaWebhookDto implements IC9JAWebhook {
  @ApiProperty({
    example: 'subscription.created',
    description: 'The event type for the webhook',
  })
  @IsString()
  @IsNotEmpty()
  event: 'subscription.created' | 'subscription.updated';

  @ApiProperty({
    description: 'The data payload for the webhook',
    example: {
      user: {
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
      },
    },
  })
  @IsObject()
  @IsNotEmptyObject()
  data: {
    user: IImportClientFromC9JA;
  };
}
