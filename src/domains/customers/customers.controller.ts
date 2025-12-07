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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDto } from './dto/customer.dto';
import { SearchAndPaginateCustomerDto } from './dto/query-and-paginate-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiBearerAuth()
@ApiTags('Customers')
@Controller({
  version: '1',
  path: 'customers',
})
@AuditLog({
  model: 'Customer',
})
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @ApiOkResponse({
    description: 'Customer created',
    type: CustomerDto,
  })
  @AuditLog({
    action: 'Create customer',
  })
  @Post('')
  async create(
    @Body()
    dto: CreateCustomerDto,
  ) {
    const data = await this.customersService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Customers retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(CustomerDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get customers',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateCustomerDto,
  ) {
    const [data, total] = await this.customersService.search(query);

    return new PaginatedDto(CustomerDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Customer retrieved successfully',
    type: CustomerDto,
  })
  @AuditLog({
    action: 'Get customer by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.customersService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Customer updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Customer updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update customer',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    await this.customersService.update(id, dto);

    return {
      message: 'Customer updated',
    };
  }
}
