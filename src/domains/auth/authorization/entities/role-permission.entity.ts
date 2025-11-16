import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';

import { RolePermissionDto } from '../dto/role-permission.dto';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('role_permissions')
@SetDto(RolePermissionDto)
export class RolePermission extends BaseEntity<RolePermissionDto> {
  @Column({ type: 'uuid' })
  role_id: string;

  @Column({ type: 'uuid' })
  permission_id: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Role;

  @ManyToOne(() => Permission, { eager: true })
  @JoinColumn({ name: 'permission_id', referencedColumnName: 'id' })
  permission?: Permission;
}
