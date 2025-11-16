import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/domains/auth/users/dto/user.dto';
import { ActivityDto } from '@/domains/shared/activities/dto/activity.dto';
import { DocumentDto } from '@/domains/shared/documents/dto/document.dto';

import { BaseDto } from '../../../common/dto/base.dto';
import { ActiveSubscriptionDto } from '../club-members/active-subscription/dto/active-subscription.dto';
import { Client } from '../entities/client.entity';
import { ClientStatus } from '../types';

export class ClientDto extends BaseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the admin associated with the client',
    nullable: true,
  })
  admin_user_id: string | null;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the lead associated with the client',
  })
  lead_id: string | null;

  @ApiProperty({
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
  })
  email: string;

  @ApiProperty({
    example: '08123456789',
  })
  phone_number: string;

  @ApiProperty({
    example: 'new',
  })
  status: ClientStatus;

  @ApiProperty({
    example: true,
  })
  is_onboarded: boolean;

  @ApiProperty({
    example: 1700000000,
  })
  last_contacted_at: number | null;

  @ApiProperty({
    example: 1700000000,
    nullable: true,
  })
  next_follow_up_at?: number | null;

  @ApiProperty({
    type: UserDto,
    nullable: true,
  })
  admin_user?: UserDto;

  @ApiProperty({
    type: [DocumentDto],
    nullable: true,
  })
  documents?: DocumentDto[];

  @ApiProperty({
    type: [ActivityDto],
    nullable: true,
  })
  activities?: ActivityDto[];

  @ApiProperty({
    type: [ActiveSubscriptionDto],
    nullable: true,
    description: 'The active subscription details of the client',
  })
  active_subscriptions?: ActiveSubscriptionDto[];

  constructor(client: Client) {
    super(client);

    this.admin_user_id = client.admin_user_id;
    this.lead_id = client.lead_id;
    this.first_name = client.first_name;
    this.last_name = client.last_name;
    this.email = client.email;
    this.phone_number = client.phone_number;
    this.status = client.status;
    this.is_onboarded = client.is_onboarded;
    this.last_contacted_at = client.last_contacted_at;
    this.next_follow_up_at = client.next_follow_up_at;

    if (client.admin_user) {
      this.admin_user = client.admin_user.toDto();
    }

    if (client.documents) {
      this.documents = DocumentDto.collection(client.documents);
    }

    if (client.activities) {
      this.activities = ActivityDto.collection(client.activities);
    }

    if (client.active_subscriptions) {
      this.active_subscriptions = ActiveSubscriptionDto.collection(
        client.active_subscriptions,
      );
    }
  }
}
