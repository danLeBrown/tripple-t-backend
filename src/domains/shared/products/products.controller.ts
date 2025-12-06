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
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { SearchAndPaginateProductDto } from './dto/query-and-paginate-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiBearerAuth()
@ApiTags('Products')
@Controller({
  version: '1',
  path: 'products',
})
@AuditLog({
  model: 'Product',
})
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @ApiOkResponse({
    description: 'Product created',
    type: ProductDto,
  })
  @AuditLog({
    action: 'Create product',
  })
  @Post('')
  async create(
    @Body()
    dto: CreateProductDto,
  ) {
    const data = await this.productsService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Products retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ProductDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get products',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateProductDto,
  ) {
    const [data, total] = await this.productsService.search(query);

    return new PaginatedDto(ProductDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Product retrieved successfully',
    type: ProductDto,
  })
  @AuditLog({
    action: 'Get product by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.productsService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Product updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update product',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    await this.productsService.update(id, dto);

    return {
      message: 'Product updated',
    };
  }
}
