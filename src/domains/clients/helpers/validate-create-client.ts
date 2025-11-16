import { BadRequestException } from '@nestjs/common';

import { Lead } from '@/domains/leads/entities/lead.entity';

import { CreateClientDto } from '../dto/create-client.dto';

export function validateCreateClient(dto: CreateClientDto) {
  if (!dto.lead_id) {
    if (!dto.first_name || !dto.last_name || !dto.email || !dto.phone_number) {
      throw new BadRequestException(
        'First name, last name, email, and phone number are required',
      );
    }
  }
}

export function setFields(lead: Lead | null, dto: CreateClientDto) {
  const first_name = lead?.first_name || dto.first_name;
  const last_name = lead?.last_name || dto.last_name;
  const email = lead?.email || dto.email;
  const phone_number = lead?.phone_number || dto.phone_number;

  if (!first_name || !last_name || !email || !phone_number) {
    throw new BadRequestException(
      'First name, last name, email, and phone number are required',
    );
  }

  return {
    first_name,
    last_name,
    email,
    phone_number,
  };
}
