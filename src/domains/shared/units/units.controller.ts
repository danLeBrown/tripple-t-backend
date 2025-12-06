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
import { CreateUnitDto } from './dto/create-unit.dto';
import { SearchAndPaginateUnitDto } from './dto/query-and-paginate-unit.dto';
import { UnitDto } from './dto/unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitsService } from './units.service';

@ApiBearerAuth()
@ApiTags('Units')
@Controller({
  version: '1',
  path: 'units',
})
@AuditLog({
  model: 'Unit',
})
export class UnitsController {
  constructor(private unitsService: UnitsService) {}

  @ApiOkResponse({
    description: 'Unit created',
    type: UnitDto,
  })
  @AuditLog({
    action: 'Create unit',
  })
  @Post('')
  async create(
    @Body()
    dto: CreateUnitDto,
  ) {
    const data = await this.unitsService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Units retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(UnitDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get units',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateUnitDto,
  ) {
    const [data, total] = await this.unitsService.search(query);

    return new PaginatedDto(UnitDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Unit retrieved successfully',
    type: UnitDto,
  })
  @AuditLog({
    action: 'Get unit by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.unitsService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Unit updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Unit updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update unit',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnitDto,
  ) {
    await this.unitsService.update(id, dto);

    return {
      message: 'Unit updated',
    };
  }
}
