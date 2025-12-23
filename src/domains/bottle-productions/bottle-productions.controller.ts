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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { PaginatedDto } from '@/common/dto/paginated.dto';
import { AuditLog } from '@/decorators/audit-log.decorator';

import { BottleProductionsService } from './bottle-productions.service';
import { BottleProductionDto } from './dto/bottle-production.dto';
import { CreateBottleProductionDto } from './dto/create-bottle-production.dto';
import { SearchAndPaginateBottleProductionDto } from './dto/query-and-paginate-bottle-production.dto';
import { UpdateBottleProductionDto } from './dto/update-bottle-production.dto';

@ApiBearerAuth()
@ApiTags('Bottle Productions')
@Controller({ path: 'bottle-productions', version: '1' })
@AuditLog({
  model: 'Bottle Productions',
})
export class BottleProductionsController {
  constructor(private bottleProductionsService: BottleProductionsService) {}

  @ApiOkResponse({
    description: 'Bottle production created successfully',
    type: BottleProductionDto,
  })
  @AuditLog({
    action: 'Create bottle production',
  })
  @Post('')
  async create(@Body() dto: CreateBottleProductionDto) {
    const data = await this.bottleProductionsService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Bottle productions retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(BottleProductionDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get bottle productions',
  })
  @Get('search')
  async search(@Query() query: SearchAndPaginateBottleProductionDto) {
    const [data, total] = await this.bottleProductionsService.search(query);

    return new PaginatedDto(BottleProductionDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Bottle production retrieved successfully',
    type: BottleProductionDto,
  })
  @AuditLog({
    action: 'Get bottle production by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.bottleProductionsService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Bottle production updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Bottle production updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update bottle production',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBottleProductionDto,
  ) {
    await this.bottleProductionsService.update(id, dto);

    return {
      message: 'Bottle production updated',
    };
  }

  @ApiOkResponse({
    description: 'Bottle production deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Bottle production deleted',
        },
      },
    },
  })
  @AuditLog({
    action: 'Delete bottle production',
  })
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.bottleProductionsService.delete(id);

    return {
      message: 'Bottle production deleted',
    };
  }
}
