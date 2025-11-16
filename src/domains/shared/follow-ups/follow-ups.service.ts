import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, getUnixTime, startOfDay } from 'date-fns';
import { Between, FindOptionsWhere, Repository } from 'typeorm';

import { ClientsService } from '@/domains/clients/clients.service';
import { LeadsService } from '@/domains/leads/leads.service';

import {
  CreateFollowUpDto,
  CreateFollowUpDtoOmitResource,
} from './dto/create-follow-up.dto';
import { QueryFollowUpDto } from './dto/query-follow-up.dto';
import { FollowUp } from './entities/follow-up.entity';

@Injectable()
export class FollowUpsService {
  constructor(
    @InjectRepository(FollowUp)
    private repo: Repository<FollowUp>,
    private leadsService: LeadsService,
    private clientsService: ClientsService,
  ) {}

  private async createOrUpdate(dto: CreateFollowUpDto) {
    await this.repo.upsert(
      { ...dto },
      {
        conflictPaths: ['resource_id', 'resource_name'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    const followUp = await this.repo.findOne({
      where: {
        resource_id: dto.resource_id,
        resource_name: dto.resource_name,
      },
    });

    if (!followUp) {
      throw new NotFoundException('Follow-up not found');
    }

    return followUp;
  }

  async createForLead(lead_id: string, dto: CreateFollowUpDtoOmitResource) {
    const lead = await this.leadsService.findOneBy(
      {
        id: lead_id,
      },
      false,
    );

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return this.createOrUpdate({
      ...dto,
      resource_id: lead.id,
      resource_name: 'leads',
    });
  }

  async createForClient(client_id: string, dto: CreateFollowUpDtoOmitResource) {
    const client = await this.clientsService.findOneBy(
      {
        id: client_id,
      },
      false,
    );

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.createOrUpdate({
      ...dto,
      resource_id: client.id,
      resource_name: 'clients',
    });
  }

  findBy(q?: QueryFollowUpDto) {
    return this.repo.find({
      where: q,
      relations: { client: true, lead: true, user: true },
      order: {
        follow_up_at: 'ASC',
      },
    });
  }

  findDueToday(timestamp_today?: number) {
    timestamp_today = timestamp_today ? timestamp_today * 1000 : Date.now();

    const start_time = getUnixTime(startOfDay(new Date(timestamp_today)));
    const end_time = getUnixTime(endOfDay(new Date(timestamp_today)));

    return this.repo.find({
      where: {
        follow_up_at: Between(start_time, end_time),
        is_done: false,
      },
      relations: {
        lead: true,
        client: true,
      },
    });
  }

  async markAsDone(id: string) {
    const followUp = await this.repo.findOneBy({ id });

    if (!followUp) {
      throw new NotFoundException('Follow-up not found');
    }

    return this.repo.update(id, { is_done: true });
  }

  async reschedule(dto: { id: string; follow_up_at: number }) {
    const { id, follow_up_at } = dto;

    const followUp = await this.repo.findOneBy({ id });
    if (!followUp) {
      throw new NotFoundException('Follow-up not found');
    }

    return this.repo.update(id, { follow_up_at });
  }

  async findOneByOrFail(q: FindOptionsWhere<FollowUp>) {
    const followUp = await this.repo.findOneBy(q);

    if (!followUp) {
      throw new NotFoundException('Follow-up not found');
    }

    return followUp;
  }
}
