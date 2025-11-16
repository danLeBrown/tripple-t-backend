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

  constructor(u: Upload) {
    super(u);
    this.name = u.name;
    this.relative_url = u.relative_url;
  }

  static collection<T extends BaseDto>(entities: Array<BaseEntity<T>>): T[] {
    return entities.map((e) => e.toDto()) as T[];
  }
}
