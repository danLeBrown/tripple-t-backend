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
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import {
  QueryAndPaginateExpenseDto,
  SearchAndPaginateExpenseDto,
} from './dto/query-and-paginate-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@ApiBearerAuth()
@ApiTags('Expenses')
@Controller({
  version: '1',
  path: 'expenses',
})
@AuditLog({
  model: 'Expense',
})
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @ApiOkResponse({
    description: 'Expense created',
    type: ExpenseDto,
  })
  @AuditLog({
    action: 'Create expense',
  })
  @Post('')
  async create(
    @Body()
    dto: CreateExpenseDto,
  ) {
    const data = await this.expensesService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Expenses retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ExpenseDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get expenses',
  })
  @Get('')
  async findBy(
    @Query()
    query: QueryAndPaginateExpenseDto,
  ) {
    const [data, total] = await this.expensesService.findBy(query);

    return new PaginatedDto(ExpenseDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Expenses retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ExpenseDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get expenses',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateExpenseDto,
  ) {
    const [data, total] = await this.expensesService.search(query);

    return new PaginatedDto(ExpenseDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Expense retrieved successfully',
    type: ExpenseDto,
  })
  @AuditLog({
    action: 'Get expense by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.expensesService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Expense updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Expense updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update expense',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    await this.expensesService.update(id, dto);

    return {
      message: 'Expense updated',
    };
  }
}
