import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';
import { User } from '@/domains/auth/users/entities/user.entity';
import { Document } from '@/domains/shared/documents/entities/document.entity';
import { Tag } from '@/domains/shared/tags/entities/tag.entity';

import { BaseEntity } from '../../../common/base.entity';
import { LeadDto } from '../dto/lead.dto';
import { LeadProduct, LeadSource, LeadStatus, leadStatus } from '../types';

@Entity({ name: 'leads' })
@SetDto(LeadDto)
export class Lead extends BaseEntity<LeadDto> {
  @Column({ type: 'uuid' })
  admin_user_id: string;

  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  phone_number: string;

  @Column({ type: 'varchar', length: 255 })
  company_name: string;

  @Column({ type: 'varchar', length: 255, default: leadStatus.New })
  status: LeadStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source: LeadSource;

  @Column({ type: 'varchar', length: 255, nullable: true })
  product: LeadProduct;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'int', nullable: true })
  last_contacted_at: number | null;

  @Column({ type: 'int', nullable: true })
  next_follow_up_at?: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_user_id', referencedColumnName: 'id' })
  admin_user?: User;

  @OneToMany(() => Tag, (tag) => tag.lead)
  tags?: Tag[];

  @OneToMany(() => Document, (document) => document.lead)
  documents?: Document[];
}
