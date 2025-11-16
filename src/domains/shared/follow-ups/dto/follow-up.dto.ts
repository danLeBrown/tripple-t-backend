import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';
import { UserDto } from '@/domains/auth/users/dto/user.dto';
import { ClientDto } from '@/domains/clients/dto/client.dto';
import { LeadDto } from '@/domains/leads/dto/lead.dto';

import { FollowUp } from '../entities/follow-up.entity';
import { FollowUpStatus, ResourceName } from '../types';

export class FollowUpDto extends BaseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the resource',
  })
  resource_id: string;

  @ApiProperty({
    example: 'leads',
    description: 'The name of the resource',
  })
  resource_name: ResourceName;

  @ApiProperty({
    example: 1716835200,
    description: 'The timestamp of the next follow-up',
  })
  follow_up_at: number;

  @ApiProperty({
    example: 'Expired',
    description: 'The status of the follow-up',
  })
  status: FollowUpStatus;

  @ApiProperty({
    example: false,
    description: 'Whether the follow-up is done or not',
  })
  is_done: boolean;

  @ApiProperty({
    type: UserDto,
    description: 'The admin user associated with the follow-up',
  })
  user?: UserDto;

  @ApiProperty({
    type: LeadDto,
    description: 'The lead associated with the follow-up',
  })
  lead?: LeadDto;

  @ApiProperty({
    type: ClientDto,
    description: 'The client associated with the follow-up',
  })
  client?: ClientDto;

  constructor(followUp: FollowUp) {
    super(followUp);

    this.resource_id = followUp.resource_id;
    this.resource_name = followUp.resource_name;
    this.follow_up_at = followUp.follow_up_at;
    this.status = followUp.status;
    this.is_done = followUp.is_done;

    if (followUp.user) {
      this.user = new UserDto(followUp.user);
    }

    if (followUp.lead) {
      this.lead = new LeadDto(followUp.lead);
    }

    if (followUp.client) {
      this.client = new ClientDto(followUp.client);
    }
  }
}
