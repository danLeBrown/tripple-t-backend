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
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { PaginatedDto } from '@/common/dto/paginated.dto';

import { AuditLog } from '../../decorators/audit-log.decorator';
import { ActivityDto } from '../shared/activities/dto/activity.dto';
import { CreateActivityWithoutResourceDto } from '../shared/activities/dto/create-activity.dto';
import { DocumentDto } from '../shared/documents/dto/document.dto';
import { CreateUploadDto } from '../uploads/dto/create-upload.dto';
import { ClientsService } from './clients.service';
import { ClientDto } from './dto/client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import {
  QueryAndPaginateClientDto,
  SearchAndPaginateClientDto,
} from './dto/query-and-paginate-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiBearerAuth()
@ApiTags('Clients')
@Controller({
  version: '1',
  path: 'clients',
})
@AuditLog({
  model: 'Client',
})
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @ApiOkResponse({
    description: 'Client created',
    type: ClientDto,
  })
  @Post('')
  @AuditLog({
    action: 'Create client',
  })
  async create(
    @Body()
    dto: CreateClientDto,
  ) {
    const data = await this.clientsService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiExtraModels(CreateActivityWithoutResourceDto)
  @ApiBody({
    type: [CreateActivityWithoutResourceDto],
    description: 'Array of activities to be created for the client',
    required: true,
  })
  @ApiOkResponse({
    description: 'Client Activities created',
    type: [ActivityDto],
  })
  @AuditLog({
    action: 'Create client activities',
  })
  @Post(':id/activities')
  async createActivities(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ParseArrayPipe({ items: CreateActivityWithoutResourceDto }))
    dto: CreateActivityWithoutResourceDto[],
  ) {
    const data = await this.clientsService.createActivities(id, dto);

    return {
      data: ActivityDto.collection(data),
    };
  }

  @ApiExtraModels(CreateUploadDto)
  @ApiBody({
    type: [CreateUploadDto],
  })
  @ApiOkResponse({
    description: 'Client documents created successfully',
    type: [DocumentDto],
  })
  @AuditLog({
    action: 'Create client documents',
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
    const data = await this.clientsService.createDocuments(id, dtos);

    return {
      data: DocumentDto.collection(data),
    };
  }

  @ApiOkResponse({
    description: 'Clients retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ClientDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get clients',
  })
  @Get('')
  async findBy(
    @Query()
    query: QueryAndPaginateClientDto,
  ) {
    const [data, total] = await this.clientsService.findBy(query);

    return new PaginatedDto(ClientDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Clients retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ClientDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Search clients',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateClientDto,
  ) {
    const [data, total] = await this.clientsService.search(query);

    return new PaginatedDto(ClientDto.collection(data), {
      total,
      limit: query.limit ?? 0,
      page: query.page ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Client retrieved successfully',
    type: ClientDto,
  })
  @AuditLog({
    action: 'Get client by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.clientsService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Client updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Client updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update client',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ) {
    await this.clientsService.update(id, dto);

    return {
      message: 'Client updated',
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
  @Delete(':client_id/documents/:document_id')
  @AuditLog({
    action: 'Delete client document',
  })
  async deleteDocument(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Param('document_id', ParseUUIDPipe) document_id: string,
  ) {
    await this.clientsService.deleteDocument({ id: client_id, document_id });

    return {
      message: 'Document deleted',
    };
  }
}
