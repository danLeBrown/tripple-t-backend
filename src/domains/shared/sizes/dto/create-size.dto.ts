import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateSizeDto {
  @ApiProperty({
    description: 'The value of the size',
    example: 42,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  value: number;
}
