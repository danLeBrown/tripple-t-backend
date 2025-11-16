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
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuditLog } from '@/decorators/audit-log.decorator';

import { CreateFollowUpDtoOmitResource } from './dto/create-follow-up.dto';
import { FollowUpDto } from './dto/follow-up.dto';
import { QueryFollowUpDto } from './dto/query-follow-up.dto';
import { RescheduleFollowUpDto } from './dto/update-follow-up.dto';
import { FollowUpsService } from './follow-ups.service';

@ApiBearerAuth()
@ApiTags('Follow Ups')
@Controller({
  path: 'follow-ups',
  version: '1',
})
export class FollowUpsController {
  constructor(private followUpsService: FollowUpsService) {}

  @ApiOkResponse({
    description: 'Follow-up created successfully',
    type: FollowUpDto,
  })
  @AuditLog({
    model: 'FollowUp',
    action: 'Create follow up',
  })
  @Post('leads/:lead_id')
  async createForLead(
    @Param('lead_id', ParseUUIDPipe) lead_id: string,
    @Body() dto: CreateFollowUpDtoOmitResource,
  ) {
    const data = await this.followUpsService.createForLead(lead_id, dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Follow-up created successfully',
    type: FollowUpDto,
  })
  @AuditLog({
    model: 'FollowUp',
    action: 'Create follow up',
  })
  @Post('clients/:client_id')
  async createForClient(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Body() dto: CreateFollowUpDtoOmitResource,
  ) {
    const data = await this.followUpsService.createForClient(client_id, dto);

    return {
      data: data.toDto(),
    };
  }

  @ApiOkResponse({
    description: 'Follow-ups retrieved successfully',
    type: [FollowUpDto],
  })
  @AuditLog({
    model: 'FollowUp',
    action: 'Find all follow-ups',
  })
  @Get()
  async findAll(
    @Query()
    query: QueryFollowUpDto,
  ) {
    const data = await this.followUpsService.findBy(query);

    return {
      data: FollowUpDto.collection(data),
    };
  }

  @ApiOkResponse({
    description: 'Follow-up marked as done',
    type: Object,
    schema: {
      example: {
        message: 'Follow-up marked as done successfully',
      },
    },
  })
  @AuditLog({
    model: 'FollowUp',
    action: 'Mark as done',
  })
  @Patch('/:id/done')
  async markAsDone(@Param('id', ParseUUIDPipe) id: string) {
    await this.followUpsService.markAsDone(id);

    return {
      message: 'Follow-up marked as done successfully',
    };
  }

  @ApiOkResponse({
    description: 'Follow-up rescheduled',
    type: Object,
    schema: {
      example: {
        message: 'Follow-up rescheduled successfully',
      },
    },
  })
  @AuditLog({
    model: 'FollowUp',
    action: 'Reschedule',
  })
  @Patch('/:id/reschedule')
  async reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    dto: RescheduleFollowUpDto,
  ) {
    await this.followUpsService.reschedule({
      id,
      follow_up_at: dto.follow_up_at,
    });

    return {
      message: 'Follow-up rescheduled successfully',
    };
  }
}
