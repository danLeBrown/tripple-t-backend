import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDto {
  @ApiProperty({
    example: 'John',
    description: 'Search query for name or other relevant fields',
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}
