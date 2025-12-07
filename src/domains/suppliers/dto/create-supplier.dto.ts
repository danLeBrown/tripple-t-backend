import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'Acme Inc.',
    description: 'The business name of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  business_name: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  contact_person_first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  contact_person_last_name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email address of the supplier',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => String(value).toLowerCase().trim())
  contact_person_email?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  contact_person_phone_number: string;

  @ApiProperty({
    example: '123 Main St, Anytown, USA',
    description: 'The address of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'California',
    description: 'The state of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  state: string;
}
