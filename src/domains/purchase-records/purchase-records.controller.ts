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

import { CreateSupplierPurchaseRecordDto } from './dto/create-supplier-purchase-record.dto';
import { PurchaseRecordDto } from './dto/purchase-record.dto';
import { SearchAndPaginatePurchaseRecordDto } from './dto/query-and-paginate-purchase-record.dto';
import { UpdatePurchaseRecordDto } from './dto/update-purchase-record.dto';
import { PurchaseRecordsService } from './purchase-records.service';

@ApiBearerAuth()
@ApiTags('Purchase Records')
@Controller({ path: 'purchase-records', version: '1' })
@AuditLog({
  model: 'Purchase Records',
})
export class PurchaseRecordsController {
  constructor(private purchaseRecordsService: PurchaseRecordsService) {}

  @ApiOkResponse({
    description: 'Purchase records created successfully',
    type: [PurchaseRecordDto],
  })
  @Post('suppliers/:supplier_id')
  async createForSuppliers(
    @Param('supplier_id', ParseUUIDPipe)
    supplier_id: string,
    @Body() dto: CreateSupplierPurchaseRecordDto,
  ) {
    const data = await this.purchaseRecordsService.createForSuppliers(
      supplier_id,
      dto,
    );

    return { data: PurchaseRecordDto.collection(data) };
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
              items: { $ref: getSchemaPath(PurchaseRecordDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get purchase records',
  })
  @Get('search')
  async search(@Query() query: SearchAndPaginatePurchaseRecordDto) {
    const [data, total] = await this.purchaseRecordsService.search(query);

    return new PaginatedDto(PurchaseRecordDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Purchase record retrieved successfully',
    type: PurchaseRecordDto,
  })
  @AuditLog({
    action: 'Get purchase record by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.purchaseRecordsService.findOneByOrFail({ id });

    return { data: data.toDto() };
  }

  @ApiOkResponse({
    description: 'Purchase record updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Purchase record updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update purchase record',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePurchaseRecordDto,
  ) {
    await this.purchaseRecordsService.update(id, dto);

    return {
      message: 'Purchase record updated',
    };
  }

  @ApiOkResponse({
    description: 'Purchase record deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Purchase record deleted',
        },
      },
    },
  })
  @AuditLog({
    action: 'Delete purchase record',
  })
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.purchaseRecordsService.delete(id);

    return {
      message: 'Purchase record deleted',
    };
  }
}
