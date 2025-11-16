import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidationArguments,
} from 'class-validator';

import { Client } from '@/domains/clients/entities/client.entity';
import { EntityExists } from '@/validators/entity-exists';

import { ClubMemberStatus, clubMemberStatus } from '../types';

export class CreateClubMemberDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      "Unique identifier for the club member's associated with the club member",
    required: true,
  })
  @IsOptional()
  @EntityExists(
    [
      Client,
      (args: ValidationArguments) => ({ id: args.object[args.property] }),
    ],
    {
      message: 'Client not found',
    },
  )
  client_id?: string;

  @ApiProperty({
    example: 'Tech Innovations Ltd',
    description: 'Company name of the club member',
  })
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @ApiProperty({
    example: '123 Tech Street, Silicon Valley, CA',
    description: 'Company address of the club member',
  })
  @IsString()
  @IsNotEmpty()
  company_address: string;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Job role of the club member',
  })
  @IsString()
  @IsNotEmpty()
  job_role: string;

  @ApiProperty({
    example: 'Technology',
    description: 'Type of organization the club member belongs to',
  })
  @IsString()
  @IsNotEmpty()
  organization_type: string;

  @ApiProperty({
    example: 'Software Development, AI Solutions',
    description: 'Services offered by the club member',
  })
  @IsString()
  @IsNotEmpty()
  services: string;

  @ApiProperty({
    example: '50-100',
    description: 'Size of the team in the club member organization',
  })
  @IsString()
  @IsNotEmpty()
  team_size: string;

  @ApiProperty({
    example: 'new',
    description: 'Status of the club member',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(clubMemberStatus))
  status?: ClubMemberStatus;
}
