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

import { AuditLog } from '../../../decorators/audit-log.decorator';
import { ActivityDto } from '../../shared/activities/dto/activity.dto';
import { CreateActivityWithoutResourceDto } from '../../shared/activities/dto/create-activity.dto';
import { DocumentDto } from '../../shared/documents/dto/document.dto';
import { CreateUploadDto } from '../../uploads/dto/create-upload.dto';
import { ClubMembersService } from './club-members.service';
import { ClubMemberDto } from './dto/club-member.dto';
import { CreateClubMemberDto } from './dto/create-club-member.dto';
import {
  QueryAndPaginateClubMemberDto,
  SearchAndPaginateClubMemberDto,
} from './dto/query-and-paginate-club-member.dto';
import { UpdateClubMemberDto } from './dto/query-or-update-club-member.dto';

@ApiBearerAuth()
@ApiTags('Club Members')
@Controller({
  version: '1',
  path: 'club-members',
})
@AuditLog({
  model: 'ClubMember',
})
export class ClubMembersController {
  constructor(private clubMembersService: ClubMembersService) {}

  @ApiOkResponse({
    description: 'Club Member created',
    type: ClubMemberDto,
  })
  @Post('')
  @AuditLog({
    action: 'Create Club member',
  })
  async create(
    @Body()
    dto: CreateClubMemberDto,
  ) {
    const data = await this.clubMembersService.create(dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiExtraModels(CreateActivityWithoutResourceDto)
  @ApiBody({
    type: [CreateActivityWithoutResourceDto],
    description: 'Array of activities to be created for the Club Member',
    required: true,
  })
  @ApiOkResponse({
    description: 'Club Member Activities created',
    type: [ActivityDto],
  })
  @AuditLog({
    action: 'Create clubMember activities',
  })
  @Post(':id/activities')
  async createActivities(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ParseArrayPipe({ items: CreateActivityWithoutResourceDto }))
    dto: CreateActivityWithoutResourceDto[],
  ) {
    const data = await this.clubMembersService.createActivities(id, dto);

    return {
      data: ActivityDto.collection(data),
    };
  }

  @ApiExtraModels(CreateUploadDto)
  @ApiBody({
    type: [CreateUploadDto],
  })
  @ApiOkResponse({
    description: 'Club members documents created successfully',
    type: [DocumentDto],
  })
  @AuditLog({
    action: 'Create club members documents',
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
    const data = await this.clubMembersService.createDocuments(id, dtos);

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
              items: { $ref: getSchemaPath(ClubMemberDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Get Club members',
  })
  @Get('')
  async findBy(
    @Query()
    query: QueryAndPaginateClubMemberDto,
  ) {
    const [data, total] = await this.clubMembersService.findBy(query);

    return new PaginatedDto(ClubMemberDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Club members retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ClubMemberDto) },
            },
          },
        },
      ],
    },
  })
  @AuditLog({
    action: 'Search Club members',
  })
  @Get('search')
  async search(
    @Query()
    query: SearchAndPaginateClubMemberDto,
  ) {
    const [data, total] = await this.clubMembersService.search(query);

    return new PaginatedDto(ClubMemberDto.collection(data), {
      total,
      page: query.page ?? 0,
      limit: query.limit ?? 0,
    });
  }

  @ApiOkResponse({
    description: 'Club Member retrieved successfully',
    type: ClubMemberDto,
  })
  @AuditLog({
    action: 'Get Club member by ID',
  })
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.clubMembersService.findOneByOrFail({ id });

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Club Member updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Club Member updated',
        },
      },
    },
  })
  @AuditLog({
    action: 'Update Club Member',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClubMemberDto,
  ) {
    await this.clubMembersService.update(id, dto);

    return {
      message: 'Club Member updated',
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
  @Delete(':club_member_id/documents/:document_id')
  @AuditLog({
    action: 'Delete club member document',
  })
  async deleteDocument(
    @Param('club_member_id', ParseUUIDPipe) club_member_id: string,
    @Param('document_id', ParseUUIDPipe) document_id: string,
  ) {
    await this.clubMembersService.deleteDocument({
      id: club_member_id,
      document_id,
    });

    return {
      message: 'Document deleted',
    };
  }
}
