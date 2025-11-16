import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { PaginatedDto } from '@/common/dto/paginated.dto';

import { AuditLog } from '../../decorators/audit-log.decorator';
import { DocumentDto } from '../shared/documents/dto/document.dto';
import { CreateTagWithoutResourceDto } from '../shared/tags/dto/create-tag.dto';
import { TagDto } from '../shared/tags/dto/tag.dto';
import { CreateUploadDto } from '../uploads/dto/create-upload.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadDto } from './dto/lead.dto';
import {
  QueryAndPaginateLeadDto,
  SearchAndPaginateLeadDto,
} from './dto/query-and-paginate-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';
import {
  leadProduct,
  leadScoreTag,
  leadSource,
  LeadStatus,
  leadStatus,
} from './types';

@ApiBearerAuth()
@ApiTags('Leads')
@Controller({
  version: '1',
  path: 'leads',
})
@AuditLog({
  model: 'Lead',
})
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @ApiOkResponse({
    description: 'Lead created',
    type: LeadDto,
  })
  @AuditLog({
    action: 'Create lead',
  })
  @Post('')
  async create(
    @Body()
    dto: CreateLeadDto,
  ) {
    const data = await this.leadsService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiExtraModels(CreateTagWithoutResourceDto)
  @ApiBody({
    type: [CreateTagWithoutResourceDto],
    description: 'Array of tags to be created for the lead',
    required: true,
  })
  @ApiOkResponse({
    description: 'Lead Tags created',
    type: [TagDto],
  })
  @AuditLog({
    action: 'Create tags for lead',
  })
  @Post(':id/tags')
  async createTags(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ParseArrayPipe({ items: CreateTagWithoutResourceDto }))
    dto: CreateTagWithoutResourceDto[],
  ) {
    const data = await this.leadsService.createTags(id, dto);

    return {
      data: TagDto.collection(data),
    };
  }

  @ApiExtraModels(CreateUploadDto)
  @ApiBody({
    type: [CreateUploadDto],
  })
  @ApiOkResponse({
    description: 'Lead documents created successfully',
    type: [DocumentDto],
  })
  @AuditLog({
    action: 'Upload documents for lead',
  })
  @Post(':id/documents')
  async createDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(
      new ParseArrayPipe({
        items: CreateUploadDto,
      }),
    )
    dtos: CreateUploadDto[],
  ) {
    const data = await this.leadsService.createDocuments(id, dtos);

    return {
      data: DocumentDto.collection(data),
    };
  }

  @ApiExtraModels(PaginatedDto)
  @ApiOkResponse({
    description: 'Leads retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(LeadDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Find leads',
  })
  @Get('')
  async findBy(
    @Query()
    query: QueryAndPaginateLeadDto,
  ) {
    const [data, total] = await this.leadsService.findBy(query);

    return new PaginatedDto(LeadDto.collection(data), {
      total,
      limit: query.limit ?? 0,
      page: query.page ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Leads retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(LeadDto) },
            },
          },
        },
      ],
    },
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: leadStatus,
    description: 'Filter by lead status',
  })
  @ApiQuery({
    name: 'source',
    required: false,
    enum: leadSource,
    description: 'Filter by lead source',
  })
  @ApiQuery({
    name: 'product',
    required: false,
    enum: leadProduct,
    description: 'Filter by lead product',
  })
  @ApiQuery({
    name: 'score_tag',
    required: false,
    enum: leadScoreTag,
    description: 'Filter by lead score tag',
  })
  @ApiQuery({
    name: 'admin_user_id',
    required: false,
    type: String,
    description: 'Filter by admin user ID',
  })
  @AuditLog({
    action: 'Search leads',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateLeadDto,
  ) {
    const [data, total] = await this.leadsService.search(query);

    return new PaginatedDto(LeadDto.collection(data), {
      total,
      limit: query.limit ?? 0,
      page: query.page ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Leads grouped by status',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'new',
              },
              count: {
                type: 'number',
                example: 10,
              },
            },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Optional status to filter by',
    enum: leadStatus,
  })
  @AuditLog({
    action: 'Group leads by status',
  })
  @Get('group-by-status')
  async groupByStatus(@Query('status') status?: LeadStatus) {
    const data = await this.leadsService.groupByStatus(status);

    return {
      data,
    };
  }

  @ApiOkResponse({
    description: 'Lead retrieved successfully',
    type: LeadDto,
  })
  @AuditLog({
    action: 'Find lead by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.leadsService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Lead updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lead updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update lead',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    await this.leadsService.update(id, dto);

    return {
      message: 'Lead updated',
    };
  }

  @ApiOkResponse({
    description: 'Document deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Document deleted',
        },
      },
    },
  })
  @Delete(':lead_id/documents/:document_id')
  @AuditLog({
    action: 'Delete lead document',
  })
  async deleteDocument(
    @Param('lead_id', ParseUUIDPipe) lead_id: string,
    @Param('document_id', ParseUUIDPipe) document_id: string,
  ) {
    await this.leadsService.deleteDocument({ id: lead_id, document_id });

    return {
      message: 'Document deleted',
    };
  }
}
