import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'John',
    description: 'The first name of the customer',
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the customer',
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email address of the customer',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the customer',
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    example: '123 Main St, Anytown, USA',
    description: 'The address of the customer',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'California',
    description: 'The state of the customer',
  })
  @IsString()
  @IsNotEmpty()
  state: string;
}
