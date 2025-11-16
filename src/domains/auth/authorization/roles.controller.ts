import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { AuditLog } from '@/decorators/audit-log.decorator';

import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';
import { CreateRolePermissionsDto } from './dto/create-role-permission.dto';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { RoleDto } from './dto/role.dto';
import { RolePermissionDto } from './dto/role-permission.dto';
import { UserRoleDto } from './dto/user-role.dto';
import { RolesService } from './roles.service';

@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'authorization/roles',
})
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('')
  @ApiOkResponse({
    description: 'Create a new role',
    type: RoleDto,
  })
  @AuditLog({
    action: 'Create role',
  })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const data = await this.rolesService.create(createRoleDto);
    return { data: data.toDto() };
  }

  @Post(':id/permissions')
  @ApiOkResponse({
    description: 'Assign permissions to a role',
    type: RoleDto,
  })
  @AuditLog({
    action: 'Assign permissions to role',
  })
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    dto: CreateRolePermissionsDto,
  ) {
    const data = await this.rolesService.assignPermissions(
      id,
      dto.permission_ids,
    );

    return { data: RolePermissionDto.collection(data) };
  }

  @Post('users')
  @ApiOkResponse({
    description: 'Assign users to a role',
    type: UserRoleDto,
  })
  @AuditLog({
    action: 'Assign users to role',
  })
  async assignUser(@Body() dto: CreateUserRoleDto) {
    const data = await this.rolesService.assignUserRole(dto);

    return { data: data.toDto() };
  }

  @Get('')
  @ApiOkResponse({
    description: 'Get all roles',
    type: [RoleDto],
  })
  @AuditLog({
    action: 'Get all roles',
  })
  async findBy(@Query() query: QueryRoleDto) {
    const data = await this.rolesService.findBy(query);
    return {
      data: RoleDto.collection(data),
    };
  }

  @Get('/:id/users')
  @ApiOkResponse({
    description: 'Get all users assigned to a role',
    type: [UserRoleDto],
  })
  @AuditLog({
    action: 'Get users by role',
  })
  async findUsersByRole(@Param('id', ParseUUIDPipe) roleId: string) {
    const data = await this.rolesService.getUsers(roleId);
    return {
      data: UserRoleDto.collection(data),
    };
  }

  @Get('/:id/permissions')
  @ApiOkResponse({
    description: 'Get all permissions assigned to a role',
    type: [RolePermissionDto],
  })
  @AuditLog({
    action: 'Get permissions by role',
  })
  async findPermissionsByRole(@Param('id', ParseUUIDPipe) roleId: string) {
    const data = await this.rolesService.getPermissions(roleId);
    return {
      data: RolePermissionDto.collection(data),
    };
  }

  @Get('/:id')
  @ApiOkResponse({
    description: 'Get a role by ID',
    type: RoleDto,
  })
  @AuditLog({
    action: 'Get role by ID',
  })
  async findOneRole(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.rolesService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @Patch('/:id')
  @ApiOkResponse({
    description: 'Role updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Role updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update role',
  })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    await this.rolesService.update(id, updateRoleDto);

    return {
      message: 'Role updated',
    };
  }

  @Delete(':id/permissions')
  @ApiOkResponse({
    description: 'Role permission deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Role permission deleted',
        },
      },
    },
  })
  @AuditLog({
    action: 'Delete role permission',
  })
  async removePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRolePermissionsDto,
  ) {
    await this.rolesService.removePermissions(id, dto.permission_ids);

    return {
      message: 'Role permissions deleted',
    };
  }

  @Delete('/:id')
  @ApiOkResponse({
    description: 'Role deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Role deleted',
        },
      },
    },
  })
  @AuditLog({
    action: 'Delete role',
  })
  async removeRole(@Param('id', ParseUUIDPipe) id: string) {
    await this.rolesService.delete(id);

    return {
      message: 'Role deleted',
    };
  }

  @Delete('users/:user_id')
  @ApiOkResponse({
    description: 'Remove user from role',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User removed from role',
        },
      },
    },
  })
  @AuditLog({
    action: 'Remove user from role',
  })
  async removeUserRole(@Param('user_id', ParseUUIDPipe) id: string) {
    await this.rolesService.removeUserRole(id);

    return {
      message: 'User removed from role',
    };
  }
}
