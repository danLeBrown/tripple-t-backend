import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'John',
    description: 'The first name of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email address of the supplier',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the supplier',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

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
