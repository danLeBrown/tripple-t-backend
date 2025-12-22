import { Column, Entity } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../common/base.entity';
import { UploadDto } from '../dto/upload.dto';

@Entity({ name: 'uploads' })
@SetDto(UploadDto)
export class Upload extends BaseEntity<UploadDto> {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  relative_url: string;

  @Column({ type: 'varchar', length: 255 })
  file_mimetype: string;

  @Column({ type: 'int' })
  file_size: number;
}
