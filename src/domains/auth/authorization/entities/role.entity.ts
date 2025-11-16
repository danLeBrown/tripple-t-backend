import { Column, Entity, OneToMany } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';

import { BaseEntity } from '../../../../common/base.entity';
import { RoleDto } from '../dto/role.dto';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
@SetDto(RoleDto)
export class Role extends BaseEntity<RoleDto> {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role, {
    eager: true,
  })
  permissions?: RolePermission[];
}
