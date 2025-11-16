import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

import { ClubMemberStatus, clubMemberStatus } from '../types';
import { CreateClubMemberDto } from './create-club-member.dto';

export class QueryClubMemberDto extends PartialType(CreateClubMemberDto) {}

export class UpdateClubMemberDto extends PartialType(CreateClubMemberDto) {
  @ApiProperty({
    example: 'active',
    description: 'Status of the client',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(clubMemberStatus))
  status?: ClubMemberStatus;

  @ApiProperty({
    example: 1700000000,
    description: 'Timestamp of the last contact with the client',
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  last_contacted_at?: number;
}
