import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { BaseEntity } from '@/common/base.entity';
import { SetDto } from '@/decorators/set-dto.decorator';
import { User } from '@/domains/auth/users/entities/user.entity';

import { UserRoleDto } from '../dto/user-role.dto';
import { Role } from './role.entity';

@Entity('user_roles')
@SetDto(UserRoleDto)
export class UserRole extends BaseEntity<UserRoleDto> {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role?: Role;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;
}
