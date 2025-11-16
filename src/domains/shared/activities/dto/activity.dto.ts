import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';
import { UserDto } from '@/domains/auth/users/dto/user.dto';
import { ClientDto } from '@/domains/clients/dto/client.dto';
import { LeadDto } from '@/domains/leads/dto/lead.dto';

import { Activity } from '../entities/activity.entity';

export class ActivityDto extends BaseDto {
  @ApiProperty({
    description: 'The user ID associated with the activity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  admin_user_id: string;

  @ApiProperty({
    example: 'leads',
    description:
      'The type of resource this tag is associated with, e.g., "leads", "clients", etc.',
  })
  resource_name: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'The unique identifier of the resource this tag is associated with.',
  })
  resource_id: string;

  @ApiProperty({
    description: 'The type of activity, e.g., "call", "email", "meeting"',
    example: 'call',
  })
  type: string;

  @ApiProperty({
    description: 'The description of the activity',
    example: 'Called the client to discuss project updates',
  })
  description: string;

  @ApiProperty({
    type: UserDto,
    description: 'The user associated with the activity',
  })
  admin_user?: UserDto;

  @ApiProperty({
    type: LeadDto,
    description: 'The lead associated with the activity',
  })
  lead?: LeadDto;

  @ApiProperty({
    type: ClientDto,
    description: 'The client associated with the activity',
  })
  client?: ClientDto;

  constructor(entity: Activity) {
    super(entity);
    this.admin_user_id = entity.admin_user_id;
    this.resource_name = entity.resource_name;
    this.resource_id = entity.resource_id;
    this.type = entity.type;
    this.description = entity.description;

    if (entity.admin_user) {
      this.admin_user = new UserDto(entity.admin_user);
    }

    if (entity.lead) {
      this.lead = new LeadDto(entity.lead);
    }

    if (entity.client) {
      this.client = new ClientDto(entity.client);
    }
  }

  // static collection(entities: Activity[]): ActivityDto[] {
  //   return entities.map((entity) => new ActivityDto(entity));
  // }
}
