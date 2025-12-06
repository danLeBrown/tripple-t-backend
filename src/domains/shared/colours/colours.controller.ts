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
import { ColoursService } from './colours.service';
import { ColourDto } from './dto/colour.dto';
import { CreateColourDto } from './dto/create-colour.dto';
import { SearchAndPaginateColourDto } from './dto/query-and-paginate-colour.dto';
import { UpdateColourDto } from './dto/update-colour.dto';

@ApiBearerAuth()
@ApiTags('Colours')
@Controller({
  version: '1',
  path: 'colours',
})
@AuditLog({
  model: 'Colour',
})
export class ColoursController {
  constructor(private coloursService: ColoursService) {}

  @ApiOkResponse({
    description: 'Colour created',
    type: ColourDto,
  })
  @AuditLog({
    action: 'Create colour',
  })
  @Post('')
  async create(
    @Body()
    dto: CreateColourDto,
  ) {
    const data = await this.coloursService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Colours retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ColourDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get colours',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateColourDto,
  ) {
    const [data, total] = await this.coloursService.search(query);

    return new PaginatedDto(ColourDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Colour retrieved successfully',
    type: ColourDto,
  })
  @AuditLog({
    action: 'Get colour by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.coloursService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Colour updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Colour updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update colour',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateColourDto,
  ) {
    await this.coloursService.update(id, dto);

    return {
      message: 'Colour updated',
    };
  }
}
