import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { PaginatedDto } from '@/common/dto/paginated.dto';

import { AuditLog } from '../../../decorators/audit-log.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import {
  QueryAndPaginateUserDto,
  SearchAndPaginateUserDto,
} from './dto/query-and-paginate-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@ApiTags('Users')
@Controller({
  version: '1',
  path: 'users',
})
@AuditLog({
  model: 'User',
})
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOkResponse({
    description: 'User created',
    type: UserDto,
  })
  @AuditLog({
    action: 'Create user',
  })
  @Post('')
  async create(
    @Body()
    dto: CreateUserDto,
  ) {
    const data = await this.usersService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Users retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(UserDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get users',
  })
  @Get('')
  async findBy(
    @Query()
    query: QueryAndPaginateUserDto,
  ) {
    const [data, total] = await this.usersService.findBy(query);

    return new PaginatedDto(UserDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Users retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(UserDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get users',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateUserDto,
  ) {
    const [data, total] = await this.usersService.search(query);

    return new PaginatedDto(UserDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Admins retrieved successfully',
    type: [UserDto],
  })
  @AuditLog({
    action: 'Get admins',
  })
  @Get('admins')
  async admins() {
    const data = await this.usersService.findAdmins();

    return {
      data: UserDto.collection(data),
    };
  }

  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: UserDto,
  })
  @AuditLog({
    action: 'Get user by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.usersService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update user',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    await this.usersService.update(id, dto);

    return {
      message: 'User updated',
    };
  }
}
