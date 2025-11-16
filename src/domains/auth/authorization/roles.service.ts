import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Not, Repository } from 'typeorm';

import { slugify } from '@/helpers/string.helper';

import { UsersService } from '../users/users.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private repo: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private rolePermissionRepo: Repository<RolePermission>,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateRoleDto) {
    const exists = await this.repo.exists({
      where: { slug: slugify(dto.name) },
    });

    if (exists) {
      throw new BadRequestException(
        `Role with slug ${slugify(dto.name)} already exists`,
      );
    }

    return this.repo.save(
      this.repo.create({
        ...dto,
        slug: slugify(dto.name),
      }),
    );
  }

  async findBy(q?: QueryRoleDto) {
    return this.repo.find({
      where: q,
      order: {
        name: 'ASC',
      },
    });
  }

  async findOneByOrFail(q: FindOptionsWhere<Role>) {
    const role = await this.repo.findOneBy(q);

    if (!role) {
      throw new NotFoundException(`Role not found`);
    }

    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.repo.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    let slug = role.slug;

    if (dto.name) {
      slug = slugify(dto.name);

      const exists = await this.repo.exists({
        where: { slug, id: Not(id) },
      });

      if (exists) {
        throw new BadRequestException(
          `Role with slug ${slugify(dto.name)} already exists`,
        );
      }
    }

    return this.repo.update(id, {
      ...dto,
      slug,
    });
  }

  async delete(id: string) {
    const role = await this.repo.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return this.repo.delete(id);
  }

  async assignUserRole(dto: CreateUserRoleDto) {
    const role = await this.repo.exists({ where: { id: dto.role_id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const userRole = await this.userRoleRepo.findOne({
      where: {
        user_id: dto.user_id,
      },
    });

    if (userRole) {
      if (userRole.role_id === dto.role_id) {
        return userRole;
      }

      await this.userRoleRepo.update(userRole.id, dto);

      return this.userRoleRepo.findOneByOrFail({ id: userRole.id });
    }

    const user = await this.usersService
      .getUserRepo()
      .findOneBy({ id: dto.user_id });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (!user.is_admin) {
      throw new BadRequestException(`User is not an admin`);
    }

    return this.userRoleRepo.save(this.userRoleRepo.create(dto));
  }

  async removeUserRole(user_id: string) {
    const userRole = await this.userRoleRepo.findOneBy({ user_id });

    if (!userRole) {
      throw new NotFoundException(`User role not found`);
    }

    return this.userRoleRepo.delete({ id: userRole.id });
  }

  async assignPermissions(id: string, permission_ids: string[]) {
    const role = await this.repo.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    const permissions = await this.permissionRepo.findBy({
      id: In(permission_ids),
    });

    if (permissions.length !== permission_ids.length) {
      throw new BadRequestException('Some permissions do not exist');
    }

    const existingPermissions = await this.rolePermissionRepo.find({
      where: {
        role_id: id,
        permission_id: In(permission_ids),
      },
    });

    const newPermissions = permission_ids.filter(
      (pid) =>
        !existingPermissions.some(
          (ep) => ep.permission_id === pid && ep.role_id === id,
        ),
    );

    if (newPermissions.length === 0) {
      throw new BadRequestException('No new permissions to assign');
    }

    return this.rolePermissionRepo.save(
      this.rolePermissionRepo.create(
        newPermissions.map((pid) => ({
          role_id: id,
          permission_id: pid,
        })),
      ),
    );
  }

  async removePermissions(id: string, permission_ids: string[]) {
    const role = await this.repo.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    const permissions = await this.rolePermissionRepo.find({
      where: {
        role_id: id,
        permission_id: In(permission_ids),
      },
    });

    if (permissions.length === 0) {
      throw new BadRequestException('No permissions found to remove');
    }

    return this.rolePermissionRepo.remove(permissions);
  }

  async getPermissions(id: string) {
    const role = await this.repo.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return this.rolePermissionRepo.find({
      where: { role_id: id },
      relations: {
        permission: true,
      },
    });
  }

  async getUsers(role_id: string) {
    const role = await this.repo.findOneBy({ id: role_id });

    if (!role) {
      throw new NotFoundException(`Role with ID ${role_id} not found`);
    }

    return this.userRoleRepo.find({
      where: { role_id },
      relations: {
        user: true,
      },
    });
  }
}
