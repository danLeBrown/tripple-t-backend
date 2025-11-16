import { Column, Entity, OneToMany, OneToOne } from 'typeorm';

import { SetDto } from '@/decorators/set-dto.decorator';
import { UserRole } from '@/domains/auth/authorization/entities/user-role.entity';

import { BaseEntity } from '../../../../common/base.entity';
import { UserDto } from '../dto/user.dto';
import { UserStatus, userStatus } from '../types';
import { UserSession } from './user-session.entity';

@Entity({ name: 'users' })
@SetDto(UserDto)
export class User extends BaseEntity<UserDto> {
  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  phone_number: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'boolean', default: false })
  is_admin: boolean;

  @Column({ type: 'varchar', length: 255, default: userStatus.Active })
  status: UserStatus;

  @Column({ type: 'int', nullable: true })
  last_login_at: number | null;

  @OneToMany(() => UserSession, (session) => session.user)
  sessions?: UserSession[];

  @OneToOne(() => UserRole, (userRole) => userRole.user)
  user_role?: UserRole;
}
