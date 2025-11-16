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

import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from './dto/create-permission.dto';
import { PermissionDto } from './dto/permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'authorization/permissions',
})
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('')
  @ApiOkResponse({
    description: 'Create a new permission',
    type: PermissionDto,
  })
  @AuditLog({
    action: 'Create permission',
  })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    const data = await this.permissionsService.create(createPermissionDto);
    return { data: data.toDto() };
  }

  @Get('')
  @ApiOkResponse({
    description: 'Get all permissions',
    type: [PermissionDto],
  })
  @AuditLog({
    action: 'Get all permissions',
  })
  async findBy(@Query() query: QueryPermissionDto) {
    const data = await this.permissionsService.findBy(query);
    return {
      data: PermissionDto.collection(data),
    };
  }

  @Get('/:id')
  @ApiOkResponse({
    description: 'Get a permission by ID',
    type: PermissionDto,
  })
  @AuditLog({
    action: 'Get permission by ID',
  })
  async findOnePermission(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.permissionsService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @Patch('/:id')
  @ApiOkResponse({
    description: 'Permission updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Permission updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update permission',
  })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    await this.permissionsService.update(id, updatePermissionDto);

    return {
      message: 'Permission updated',
    };
  }

  @Delete('/:id')
  @ApiOkResponse({
    description: 'Permission deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Permission deleted',
        },
      },
    },
  })
  @AuditLog({
    action: 'Delete permission',
  })
  async removePermission(@Param('id', ParseUUIDPipe) id: string) {
    await this.permissionsService.delete(id);

    return {
      message: 'Permission deleted',
    };
  }
}
