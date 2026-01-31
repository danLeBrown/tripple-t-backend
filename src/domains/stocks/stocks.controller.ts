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
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateStockDto } from './dto/create-stock.dto';
import { SearchAndPaginateStockDto } from './dto/query-and-paginate-stock.dto';
import { StockDto } from './dto/stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StocksService } from './stocks.service';

@ApiBearerAuth()
@ApiTags('Stocks')
@Controller({
  version: '1',
  path: 'stocks',
})
@AuditLog({
  model: 'Stock',
})
export class StocksController {
  constructor(private stocksService: StocksService) {}

  @ApiOkResponse({
    description: 'Stock created',
    type: StockDto,
  })
  @AuditLog({
    action: 'Create stock',
  })
  @Post('')
  async create(@Body() dto: CreateStockDto) {
    const data = await this.stocksService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Stocks retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(StockDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get stocks',
  })
  @Get('search')
  async search(@Query() query: SearchAndPaginateStockDto) {
    const [data, total] = await this.stocksService.search(query);

    return new PaginatedDto(StockDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Stock retrieved successfully',
    type: StockDto,
  })
  @AuditLog({
    action: 'Get stock by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.stocksService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Stock updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Stock updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update stock',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
  ) {
    await this.stocksService.update(id, dto);

    return {
      message: 'Stock updated',
    };
  }

  @ApiOkResponse({
    description: 'Stock quantity adjusted successfully',
    type: StockDto,
  })
  @AuditLog({
    action: 'Adjust stock quantity',
  })
  @Post(':id/adjust')
  async adjust(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdjustStockDto,
  ) {
    const stock = await this.stocksService.findOneByOrFail({ id });
    const data = await this.stocksService.adjustQuantity({
      productId: stock.product_id,
      delta: dto.quantity_delta,
      adjustmentType: dto.adjustment_type,
      reason: dto.reason,
    });

    return {
      data: data.toDto(),
    };
  }
}
