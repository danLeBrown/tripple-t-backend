import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateColourDto {
  @ApiProperty({
    description: 'Name of the colour',
    example: 'Red',
  })
  @IsString()
  name: string;
}
