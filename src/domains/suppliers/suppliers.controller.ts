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

import { AuditLog } from '../../decorators/audit-log.decorator';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import {
  QueryAndPaginateSupplierDto,
  SearchAndPaginateSupplierDto,
} from './dto/query-and-paginate-supplier.dto';
import { SupplierDto } from './dto/supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

@ApiBearerAuth()
@ApiTags('Suppliers')
@Controller({
  version: '1',
  path: 'suppliers',
})
@AuditLog({
  model: 'Supplier',
})
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @ApiOkResponse({
    description: 'Supplier created',
    type: SupplierDto,
  })
  @AuditLog({
    action: 'Create supplier',
  })
  @Post('')
  async create(
    @Body()
    dto: CreateSupplierDto,
  ) {
    const data = await this.suppliersService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Suppliers retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(SupplierDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get suppliers',
  })
  @Get('')
  async findBy(
    @Query()
    query: QueryAndPaginateSupplierDto,
  ) {
    const [data, total] = await this.suppliersService.findBy(query);

    return new PaginatedDto(SupplierDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Suppliers retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(SupplierDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get suppliers',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateSupplierDto,
  ) {
    const [data, total] = await this.suppliersService.search(query);

    return new PaginatedDto(SupplierDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Supplier retrieved successfully',
    type: SupplierDto,
  })
  @AuditLog({
    action: 'Get supplier by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.suppliersService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Supplier updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Supplier updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update supplier',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    await this.suppliersService.update(id, dto);

    return {
      message: 'Supplier updated',
    };
  }
}
