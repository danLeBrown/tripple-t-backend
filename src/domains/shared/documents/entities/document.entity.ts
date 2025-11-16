import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';
import { Client } from '@/domains/clients/entities/client.entity';
import { Lead } from '@/domains/leads/entities/lead.entity';
import { Upload } from '@/domains/uploads/entities/upload.entity';

import { BaseEntity } from '../../../../common/base.entity';
import { DocumentDto } from '../dto/document.dto';

@Entity({ name: 'documents' })
@SetDto(DocumentDto)
export class Document extends BaseEntity<DocumentDto> {
  @Column({ type: 'varchar', length: 255 })
  resource_name: string;

  @Column({ type: 'uuid' })
  resource_id: string;

  @Column({ type: 'uuid' })
  upload_id: string;

  @OneToOne(() => Upload, { eager: true })
  @JoinColumn({ name: 'upload_id', referencedColumnName: 'id' })
  upload?: Upload;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'id' })
  lead?: Lead;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'id' })
  client?: Client;
}
