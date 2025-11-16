import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

import {
  getFileExtension,
  getFileNameWithExtension,
} from '@/helpers/file.helper';

export class CreateUploadDto {
  @ApiProperty({
    example: 'document.pdf',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value, obj }) => {
    if (!value) {
      return getFileNameWithExtension(
        obj.relative_url,
        getFileExtension(obj.relative_url),
      );
    }
    return value;
  })
  name: string;

  @ApiProperty({
    example: '2025/06/document.pdf',
    description:
      'The relative URL of the document to be associated with the resource.',
  })
  @IsString()
  @IsNotEmpty()
  // should match regex: ^\/[0-9]{4}\/[0-9]{2}\/[a-zA-Z0-9_-]+$
  // @Matches(/^\/(?:[a-zA-Z0-9._-]+\/)*[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/, {
  //   message: 'Invalid relative URL format',
  // })
  @Matches(/^[0-9]{4}\/[0-9]{2}\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/, {
    message: 'Invalid relative URL format',
  })
  relative_url: string;
}
