import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/domains/auth/users/dto/user.dto';
import { DocumentDto } from '@/domains/shared/documents/dto/document.dto';
import { TagDto } from '@/domains/shared/tags/dto/tag.dto';

import { BaseDto } from '../../../common/dto/base.dto';
import { Lead } from '../entities/lead.entity';
import {
  LeadProduct,
  leadProduct,
  LeadSource,
  leadSource,
  LeadStatus,
  leadStatus,
} from '../types';

export class LeadDto extends BaseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  admin_user_id: string;

  @ApiProperty({
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    example: 'John Doe',
  })
  full_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    example: '08123456789',
  })
  phone_number: string;

  @ApiProperty({
    example: 'Tech Innovations Ltd',
  })
  company_name: string;

  @ApiProperty({
    example: leadStatus.New,
  })
  status: LeadStatus;

  @ApiProperty({
    example: leadSource.SocialMedia,
  })
  source: LeadSource;

  @ApiProperty({
    example: leadProduct.ClubConnect,
    nullable: true,
  })
  product?: LeadProduct;

  @ApiProperty({
    example: 'Interested in our services',
    nullable: true,
  })
  notes?: string;

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
    type: [TagDto],
    nullable: true,
  })
  tags?: TagDto[];

  @ApiProperty({
    type: [DocumentDto],
    nullable: true,
  })
  documents?: DocumentDto[];

  constructor(lead: Lead) {
    super(lead);
    this.admin_user_id = lead.admin_user_id;
    this.first_name = lead.first_name;
    this.last_name = lead.last_name;
    this.full_name = `${lead.first_name} ${lead.last_name}`;
    this.email = lead.email;
    this.phone_number = lead.phone_number;
    this.status = lead.status;
    this.source = lead.source;
    this.product = lead.product;
    this.notes = lead.notes;
    this.last_contacted_at = lead.last_contacted_at;
    this.next_follow_up_at = lead.next_follow_up_at;

    if (lead.admin_user) {
      this.admin_user = lead.admin_user.toDto();
    }

    if (lead.tags) {
      this.tags = TagDto.collection(lead.tags);
    }

    if (lead.documents) {
      this.documents = DocumentDto.collection(lead.documents);
    }
  }
}
