import { Column, Entity } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../../common/base.entity';
import { PermissionDto } from '../dto/permission.dto';
import { PermissionAction, PermissionSubject } from '../types';

@Entity('permissions')
@SetDto(PermissionDto)
export class Permission extends BaseEntity<PermissionDto> {
  @Column({ type: 'varchar', length: 255 })
  subject: PermissionSubject;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  action: PermissionAction;

  @Column({ type: 'text' })
  description: string;
}
