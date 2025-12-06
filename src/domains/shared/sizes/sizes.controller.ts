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
import { CreateSizeDto } from './dto/create-size.dto';
import { SearchAndPaginateSizeDto } from './dto/query-and-paginate-size.dto';
import { SizeDto } from './dto/size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { SizesService } from './sizes.service';

@ApiBearerAuth()
@ApiTags('Sizes')
@Controller({
  version: '1',
  path: 'sizes',
})
@AuditLog({
  model: 'Size',
})
export class SizesController {
  constructor(private sizesService: SizesService) {}

  @ApiOkResponse({
    description: 'Size created',
    type: SizeDto,
  })
  @AuditLog({
    action: 'Create size',
  })
  @Post('')
  async create(
    @Body()
    dto: CreateSizeDto,
  ) {
    const data = await this.sizesService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Sizes retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(SizeDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get sizes',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateSizeDto,
  ) {
    const [data, total] = await this.sizesService.search(query);

    return new PaginatedDto(SizeDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Size retrieved successfully',
    type: SizeDto,
  })
  @AuditLog({
    action: 'Get size by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.sizesService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Size updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Size updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update size',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSizeDto,
  ) {
    await this.sizesService.update(id, dto);

    return {
      message: 'Size updated',
    };
  }
}
