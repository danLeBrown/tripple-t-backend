import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidationArguments,
} from 'class-validator';

import { User } from '@/domains/auth/users/entities/user.entity';
import { Lead } from '@/domains/leads/entities/lead.entity';
import { EntityExists } from '@/validators/entity-exists';

import { ClientStatus, clientStatus } from '../types';

export class CreateClientDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the lead associated with the client',
    required: true,
  })
  @IsOptional()
  @EntityExists(
    [Lead, (args: ValidationArguments) => ({ id: args.object[args.property] })],
    {
      message: 'Lead not found',
    },
  )
  lead_id?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the admin associated with the lead',
  })
  @IsOptional()
  @EntityExists(
    [
      User,
      (args: ValidationArguments) => ({
        id: args.object[args.property],
        is_admin: true,
      }),
    ],
    {
      message: 'Admin user not found',
    },
  )
  admin_user_id?: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the lead',
  })
  @IsOptional()
  @ValidateIf((o: CreateClientDto) => !o.lead_id)
  @IsString()
  @IsNotEmpty()
  first_name?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the lead',
  })
  @IsOptional()
  @ValidateIf((o: CreateClientDto) => !o.lead_id)
  @IsString()
  @IsNotEmpty()
  last_name?: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Email address of the lead',
  })
  @IsOptional()
  @ValidateIf((o: CreateClientDto) => !o.lead_id)
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '08123456789',
    description: 'Phone number of the lead',
  })
  @IsOptional()
  @ValidateIf((o: CreateClientDto) => !o.lead_id)
  @IsString()
  @IsNotEmpty()
  phone_number?: string;

  @ApiProperty({
    example: 'active',
    description: 'Status of the client',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(clientStatus))
  status?: ClientStatus;

  @ApiProperty({
    example: false,
    description: 'Indicates if the client has been onboarded',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_onboarded?: boolean;
}
