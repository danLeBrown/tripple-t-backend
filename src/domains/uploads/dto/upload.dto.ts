import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '@/common/base.entity';

import { BaseDto } from '../../../common/dto/base.dto';
import { Upload } from '../entities/upload.entity';

export class UploadDto extends BaseDto {
  @ApiProperty({
    example: 'proposal.pdf',
  })
  name: string;

  @ApiProperty({
    example: '/uploads/proposal.pdf',
  })
  relative_url: string;

  @ApiProperty({
    example: 'application/pdf',
  })
  file_mimetype: string;

  @ApiProperty({
    example: 1000,
  })
  file_size: number;

  constructor(u: Upload) {
    super(u);
    this.name = u.name;
    this.relative_url = u.relative_url;
    this.file_mimetype = u.file_mimetype;
    this.file_size = u.file_size;
  }

  static collection<T extends BaseDto>(entities: Array<BaseEntity<T>>): T[] {
    return entities.map((e) => e.toDto()) as T[];
  }
}
