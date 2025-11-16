import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import {
  Between,
  FindManyOptions,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { Lead } from '../leads/entities/lead.entity';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../shared/activities/activities.service';
import { CreateActivityWithoutResourceDto } from '../shared/activities/dto/create-activity.dto';
import { DocumentsService } from '../shared/documents/documents.service';
import { CreateUploadDto } from '../uploads/dto/create-upload.dto';
import { ActiveSubscriptionsService } from './club-members/active-subscription/active-subscriptions.service';
import { CreateClientDto } from './dto/create-client.dto';
import {
  QueryAndPaginateClientDto,
  SearchAndPaginateClientDto,
} from './dto/query-and-paginate-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import {
  setFields,
  validateCreateClient,
} from './helpers/validate-create-client';
import { ClientsUpdatedEvent } from './listeners/clients-updated.listener';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private repo: Repository<Client>,
    private activitiesService: ActivitiesService,
    private documentsService: DocumentsService,
    private leadsService: LeadsService,
    private eventEmitter: EventEmitter2,
    private activeSubscriptionsService: ActiveSubscriptionsService,
  ) {}

  async create(dto: CreateClientDto) {
    validateCreateClient(dto);

    let lead: Lead | null = null;

    if (dto.lead_id) {
      const exists = await this.repo.exists({
        where: {
          lead_id: dto.lead_id,
        },
      });

      if (exists) {
        throw new BadRequestException(
          'An existing client is already assigned to this lead',
        );
      }

      lead = await this.leadsService.findOneByOrFail({ id: dto.lead_id });
    }

    const { first_name, last_name, phone_number, email } = setFields(lead, dto);

    const emailExists = await this.repo.exists({
      where: {
        email,
      },
    });

    if (emailExists) {
      throw new BadRequestException('Client with this email already exists');
    }

    const phoneExists = await this.repo.exists({
      where: {
        phone_number,
      },
    });

    if (phoneExists) {
      throw new BadRequestException(
        'Client with this phone number already exists',
      );
    }

    return this.repo.save(
      this.repo.create({
        ...dto,
        first_name,
        last_name,
        email,
        phone_number,
        status: dto.status ?? 'active',
      }),
    );
  }

  // async createMany(dtos: CreateClientDto[]) {
  //   const leadIds = dtos.map((dto) => dto.lead_id).filter(Boolean);

  //   const existingLeads = await this.repo.find({
  //     where: {
  //       lead_id: In(leadIds),
  //     },
  //   });

  //   const existingLeadIds = existingLeads.map((lead) => lead.lead_id);

  //   const newDtos = dtos.filter(
  //     (dto) => !dto.lead_id || !existingLeadIds.includes(dto.lead_id),
  //   );

  //   const emails = newDtos.map((dto) => dto.email);
  //   const existingEmails = await this.repo.find({
  //     where: {
  //       email: In(emails),
  //     },
  //   });
  //   const emailsSet = new Set(existingEmails.map((e) => e.email));

  //   const phoneNumbers = newDtos.map((dto) => dto.phone_number);
  //   const existingPhoneNumbers = await this.repo.find({
  //     where: {
  //       phone_number: In(phoneNumbers),
  //     },
  //   });
  //   const phoneNumbersSet = new Set(
  //     existingPhoneNumbers.map((p) => p.phone_number),
  //   );

  //   const filteredDtos = newDtos.filter(
  //     (dto) =>
  //       !emailsSet.has(dto.email) && !phoneNumbersSet.has(dto.phone_number),
  //   );

  //   const clients = filteredDtos.map((dto) =>
  //     this.repo.create({
  //       ...dto,
  //       status: dto.status ?? 'active',
  //     }),
  //   );

  //   return this.repo.save(clients);
  // }

  async findByAndLoadRelations(options: FindManyOptions<Client> = {}) {
    return this.repo.find(options);
  }

  async findBy(query: QueryAndPaginateClientDto) {
    const {
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
      ...rest
    } = query;

    const q: FindOptionsWhere<Client> = rest;

    if (from_time && to_time) {
      q.created_at = Between(
        getUnixTime(new Date(from_time * 1000)),
        getUnixTime(new Date(to_time * 1000)),
      );
    }

    if (from_time && !to_time) {
      q.created_at = MoreThanOrEqual(getUnixTime(new Date(from_time * 1000)));
    }

    if (!from_time && to_time) {
      q.created_at = LessThanOrEqual(getUnixTime(new Date(to_time * 1000)));
    }

    return this.repo.findAndCount({
      where: q,
      order: {
        [order_by === 'name' ? 'first_name' : 'created_at']: order_direction,
      },
      relations: {},
      take: limit > 0 ? limit : undefined,
      skip: page && limit ? (page - 1) * limit : undefined,
    });
  }

  async search(query: SearchAndPaginateClientDto) {
    const {
      query: search_query,
      from_time,
      to_time,
      limit = 0,
      page = 0,
      order_by = 'name',
      order_direction = 'asc',
    } = query;

    const qb = this.repo.createQueryBuilder('client');

    if (search_query) {
      qb.where(
        'LOWER(client.first_name) LIKE :search_query OR LOWER(client.last_name) LIKE :search_query',
      )
        .orWhere('LOWER(client.email) LIKE :search_query')
        .orWhere('client.phone_number LIKE :search_query')
        .orWhere('client.status LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (from_time) {
      qb.andWhere('client.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('client.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return (
      qb
        .leftJoinAndSelect('client.admin_user', 'admin_user')

        // .leftJoinAndSelect('client.tags', 'tags')
        // .leftJoinAndSelect('client.activities', 'activities')
        // .leftJoinAndSelect('client.documents', 'documents')
        .orderBy(
          order_by === 'name' ? 'client.first_name' : 'client.created_at',
          order_direction.toUpperCase() as 'ASC' | 'DESC',
        )
        .take(limit > 0 ? limit : undefined)
        .skip(page && limit ? (page - 1) * limit : undefined)
        .getManyAndCount()
    );
  }

  async findOneBy(query: FindOptionsWhere<Client>, load_relations = true) {
    return this.repo.findOne({
      where: query,
      relations: load_relations
        ? {
            activities: true,
            documents: true,
            active_subscriptions: true,
          }
        : undefined,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<Client>) {
    const client = await this.findOneBy(query);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOneByOrFail({ id });

    if (dto.lead_id) {
      const exists = await this.repo.exists({
        where: [
          {
            lead_id: dto.lead_id,
            id: Not(id), // Ensure the lead_id is not already used by another client
          },
        ],
      });

      if (exists) {
        throw new BadRequestException(
          'Lead already assigned to another client',
        );
      }
    }

    const exe = await this.repo.update(id, dto);
    await this.eventEmitter.emitAsync('client.updated', {
      client: await this.repo.findOneByOrFail({
        id,
      }),
      dto,
    } satisfies ClientsUpdatedEvent);

    return exe;
  }

  async createActivities(id: string, dtos: CreateActivityWithoutResourceDto[]) {
    const lead = await this.repo.findOne({ where: { id } });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return Promise.all(
      dtos.map(async (dto) =>
        this.activitiesService.create({
          ...dto,
          resource_id: id,
          resource_name: 'clients',
        }),
      ),
    );
  }

  async createDocuments(id: string, dtos: CreateUploadDto[]) {
    const client = await this.repo.findOne({ where: { id } });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.documentsService.createManyWithUrl(dtos, {
      resource_name: 'clients',
      resource_id: id,
    });
  }

  async deleteDocument(q: { id: string; document_id: string }) {
    const { id, document_id } = q;

    const document = await this.documentsService.findOneByOrFail({
      id: document_id,
      resource_id: id,
      resource_name: 'clients',
    });

    return this.documentsService.delete(document.id);
  }

  async createOrUpdate(dto: CreateClientDto) {
    const existingClient = await this.repo.findOne({
      where: [{ email: dto.email }, { phone_number: dto.phone_number }],
    });

    if (existingClient) {
      await this.update(existingClient.id, dto);

      return { is_existing: true, client: existingClient };
    }

    return { is_existing: false, client: await this.create(dto) };
  }

  async count(q?: FindOptionsWhere<Client>) {
    return this.repo.count({
      where: q,
    });
  }

  getClientRepo(): Repository<Client> {
    return this.repo;
  }

  // clients that have at least one active subscription
  async getConvertedCount(): Promise<{ converted: number }> {
    const exe = await this.repo
      .createQueryBuilder('c')
      .select('COUNT(c.id)', 'converted')
      .innerJoin(
        'c.active_subscriptions',
        'as',
        'as.client_id = c.id AND as.paused_at IS NULL AND as.terminated_at IS NULL',
      )
      .getRawOne();

    if (!exe) {
      return { converted: 0 };
    }

    return { converted: Number(exe.converted) };
  }
}
