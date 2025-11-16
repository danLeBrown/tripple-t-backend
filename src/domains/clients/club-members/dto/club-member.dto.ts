import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/domains/auth/users/dto/user.dto';
import { ActivityDto } from '@/domains/shared/activities/dto/activity.dto';
import { DocumentDto } from '@/domains/shared/documents/dto/document.dto';

import { BaseDto } from '../../../../common/dto/base.dto';
import { ClientDto } from '../../dto/client.dto';
import { ClubMember } from '../entities/club-member.entity';
import { ClubMemberStatus } from '../types';

export class ClubMemberDto extends BaseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the admin associated with the client',
  })
  admin_user_id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the client',
  })
  client_id: string;

  @ApiProperty({
    example: 'The Tech Company',
    description: 'Name of the company the club member works for',
  })
  company_name: string;

  @ApiProperty({
    example: '123 Tech Street, Silicon Valley, CA',
    description: 'Address of the company',
  })
  company_address: string;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Job role of the club member',
  })
  job_role: string;

  @ApiProperty({
    example: 'Technology',
    description: 'Type of organization the club member works for',
  })
  organization_type: string;

  @ApiProperty({
    example: 'Software Development, AI Solutions',
    description: "Services provided by the club member's company",
  })
  services: string;

  @ApiProperty({
    example: '50-100',
    description: 'Size of the team the club member is part of',
  })
  team_size: string;

  @ApiProperty({
    example: 'new',
  })
  status: ClubMemberStatus;

  @ApiProperty({
    example: 1700000000,
  })
  last_contacted_at: number | null;

  @ApiProperty({
    type: UserDto,
    nullable: true,
  })
  admin_user?: UserDto;

  @ApiProperty({
    type: ClientDto,
    description: 'The client associated with the club member',
  })
  client?: ClientDto;

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

  constructor(clubMember: ClubMember) {
    super(clubMember);

    this.client_id = clubMember.client_id;
    this.company_name = clubMember.company_name;
    this.company_address = clubMember.company_address;
    this.job_role = clubMember.job_role;
    this.organization_type = clubMember.organization_type;
    this.services = clubMember.services;
    this.team_size = clubMember.team_size;
    this.status = clubMember.status;
    this.last_contacted_at = clubMember.last_contacted_at;

    if (clubMember.client) {
      this.client = clubMember.client.toDto();
    }

    if (clubMember.documents) {
      this.documents = DocumentDto.collection(clubMember.documents);
    }

    if (clubMember.activities) {
      this.activities = ActivityDto.collection(clubMember.activities);
    }
  }
}
