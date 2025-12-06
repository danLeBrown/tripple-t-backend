import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({
    description: 'Name of the unit',
    example: 'Kilogram',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Symbol of the unit',
    example: 'kg',
  })
  @IsString()
  symbol: string;
}
