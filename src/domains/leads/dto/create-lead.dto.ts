import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidationArguments,
} from 'class-validator';

import { User } from '@/domains/auth/users/entities/user.entity';
import { EntityExists } from '@/validators/entity-exists';

import {
  LeadProduct,
  leadProduct,
  LeadScoreTag,
  leadScoreTag,
  LeadSource,
  leadSource,
  LeadStatus,
  leadStatus,
} from '../types';

export class CreateLeadDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the admin associated with the lead',
  })
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
  admin_user_id: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the lead',
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the lead',
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Email address of the lead',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '08123456789',
    description: 'Phone number of the lead',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    example: 'Tech Innovations Ltd',
    description: 'Company name of the lead',
  })
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @ApiProperty({
    example: 'new',
    description: 'Status of the lead',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(leadStatus))
  status?: LeadStatus;

  @ApiProperty({
    example: 'website',
    description: 'Source of the lead',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(leadSource))
  source: LeadSource;

  @ApiProperty({
    example: 'articles',
    description: 'Product of interest',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(leadProduct))
  product?: LeadProduct;

  @ApiProperty({
    example: 'warm',
    description: 'Lead score tag',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(leadScoreTag))
  score_tag?: LeadScoreTag;

  @ApiProperty({
    example: 'Interested in our services',
    description: 'Notes about the lead',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  notes?: string;
}
