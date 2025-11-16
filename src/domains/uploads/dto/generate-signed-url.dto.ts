import { ApiProperty } from '@nestjs/swagger';
import { IsMimeType, IsString } from 'class-validator';

export class GenerateSignedUrlForUploadDto {
  @ApiProperty({
    description: 'The file mime_type to be used when uploading the file',
    example: 'image/jpeg',
  })
  @IsMimeType()
  file_mimetype: string;
}

export class GenerateSignedUrlForDownloadDto {
  @ApiProperty({
    description: 'The file key to be downloaded',
    example: '2023/10/random-file-key.jpg',
  })
  @IsString()
  key: string;
}
